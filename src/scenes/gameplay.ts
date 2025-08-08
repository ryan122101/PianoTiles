
import { Router, Scene } from '../ui/router';
import { SONGS, loadSongChart } from '../songs/index';
  import { AudioScheduler } from '../audio/scheduler';
  import { resumeAudio } from '../audio/context';
  import { Store } from '../ui/store';
  import { haptic } from '../ui/haptics';

type Note = {
  t: number;      // ms from chart start
  lane: number;   // 0..3
  dur?: number;   // for holds
  type?: 'tap' | 'hold';
  midi?: number;  // optional, for synth pitch
};

type ActiveTile = {
  note: Note;
  y: number;
  hit?: boolean;
  holdActive?: boolean;
};

export class GameplayScene implements Scene {
  id: 'play' = 'play';
  constructor(private router: Router) {}

  // runtime state
  tiles: ActiveTile[] = [];
  time = 0;
  startedAt = 0;
  speed = 1.4; // lane speed factor
  bpm = 100;
  hitWindows = { perfect: 35, great: 65, good: 90 }; // ms
  score = 0;
  combo = 0;
  stats = { perfect: 0, great: 0, good: 0, miss: 0 };
  songTitle = '';
  chartOffset = 0;
  finished = false;
  chart: Note[] = [];
  hitBuffer: number[] = []; // per-lane last hit timestamps

  enter(data?: any) {
    const index = (data && typeof data.index === 'number') ? data.index : 0;
    const meta = SONGS[index];
    this.songTitle = meta.title;
    this.bpm = meta.bpm;
    this.speed = 1.1 + Math.min(1.1, (this.bpm - 70) / 100);
    this.score = 0; this.combo = 0;
    this.stats = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.tiles = [];
    this.finished = false;
    this.hitBuffer = [ -9999, -9999, -9999, -9999 ];
    this.chartOffset = meta.offsetMs || 0;
    loadSongChart(meta.file).then((chart) => {
      this.chart = chart.notes.map(n => ({
        t: n.t,
        lane: Math.max(0, Math.min(3, (n.lane ?? 1)-1)),
        dur: n.dur || 0,
        type: n.type || 'tap',
        midi: n.midi,
      }));
      this.startedAt = performance.now();
    });
    this.router.overlay.innerHTML = `
      <div class="glass" style="position:fixed; top:10px; left:50%; transform:translateX(-50%); display:flex; gap:12px; align-items:center;">
        <span class="chip">${this.songTitle}</span>
        <span class="chip">${this.bpm} BPM</span>
        <span class="chip">Combo <span id="combo">0</span></span>
        <span class="chip">Score <span id="score">0</span></span>
      </div>
    `;
    if ('vibrate' in navigator) { try { navigator.vibrate(10); } catch {} }
  }

  exit() { this.router.overlay.innerHTML = ''; }

  update(dt: number) {
    if (!this.startedAt) return;
    const now = performance.now();
    const t = now - this.startedAt - this.chartOffset;
    this.time = t;

    // Spawn tiles: push notes into active list slightly before they should appear
    const spawnLead = 3000; // ms ahead for travel time
    const appearUntil = t + spawnLead;
    const already = new Set(this.tiles.map(a => a.note.t));
    for (const n of this.chart) {
      if (n.t <= appearUntil && !already.has(n.t)) {
        this.tiles.push({ note: n, y: -9999 });
      }
    }

    // Update tiles positions
    const canvas = this.router.canvas;
    const dpr = (canvas as any).__dpr || 1;
    const H = canvas.height;
    const travel = spawnLead; // ms it takes to reach hit line
    for (const a of this.tiles) {
      const rel = (t - a.note.t + travel) / travel; // 0 at spawn, 1 at hit line
      a.y = Math.max(-100, Math.min(H + 200, rel * H));
    }

    // Auto-clearing missed tiles (passed hit line)
    const hitLine = H - 180 * dpr;
    for (const a of this.tiles) {
      if (!a.hit && a.y > hitLine + 60 * dpr) {
        a.hit = true;
        this.combo = 0;
        this.stats.miss++;
      }
    }

    // End detection
    const lastT = this.chart.length ? this.chart[this.chart.length - 1].t : 0;
    if (!this.finished && t > lastT + 4000) {
      this.finished = true;
      const totalHits = this.stats.perfect + this.stats.great + this.stats.good + this.stats.miss;
      const acc = totalHits === 0 ? 0 : ( (this.stats.perfect*1 + this.stats.great*0.7 + this.stats.good*0.4) / totalHits ) * 100;
      this.router.goto('results', {
        title: this.songTitle,
        score: this.score,
        accuracy: acc,
        perfect: this.stats.perfect, great: this.stats.great, good: this.stats.good, miss: this.stats.miss,
        replayArgs: { index: SONGS.findIndex(s => s.title === this.songTitle) }
      });
    }

    // Update HUD
    const cEl = document.getElementById('combo'); if (cEl) cEl.textContent = String(this.combo);
    const sEl = document.getElementById('score'); if (sEl) sEl.textContent = String(this.score);
  }

  render(ctx: CanvasRenderingContext2D) {
    const canvas = (ctx.canvas as HTMLCanvasElement);
    const dpr = (canvas as any).__dpr || 1;
    const W = canvas.width;
    const H = canvas.height;

    // Background subtle gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0f12');
    g.addColorStop(1, '#131a21');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Lanes
    const lanes = 4;
    const pad = 16 * dpr;
    const laneW = (W - pad * (lanes + 1)) / lanes;
    const hitLine = H - 180 * dpr;

    for (let i=0;i<lanes;i++) {
      const x = pad + i*(laneW + pad);
      // lane background glass
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, pad, laneW, H - pad*2);
      // specular line
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x+laneW-2*dpr, pad, 2*dpr, H - pad*2);
    }

    // Hit line
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(pad, hitLine, W - pad*2, 4*dpr);

    // Draw tiles
    for (const a of this.tiles) {
      const n = a.note;
      if (a.hit) continue;
      const xIndex = n.lane;
      const x = pad + xIndex*(laneW + pad);
      const y = a.y;
      const h = (n.type === 'hold' ? Math.max(50*dpr, (n.dur||0)*0.5) : 70*dpr);
      const r = 12 * dpr;
      // tile body
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.roundRect(x, y - h, laneW, h, r);
      ctx.fill();
      // lane accent
      const hue = [200, 250, 170, 12][xIndex];
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.35)`;
      ctx.fillRect(x, y - 6*dpr, laneW, 6*dpr);
    }
  }

  onPointer(type: 'down'|'move'|'up', x: number, y: number, id: number) {
    if (type !== 'down') return;
    const canvas = this.router.canvas;
    const dpr = (canvas as any).__dpr || 1;
    const W = canvas.width;
    const H = canvas.height;
    const lanes = 4;
    const pad = 16 * dpr;
    const laneW = (W - pad * (lanes + 1)) / lanes;
    const hitLine = H - 180 * dpr;

    // Which lane?
    let lane = -1;
    for (let i=0;i<lanes;i++) {
      const x0 = pad + i*(laneW + pad);
      if (x >= x0 && x <= x0 + laneW) { lane = i; break; }
    }
    if (lane < 0) return;

    // Find nearest tile around hit line for that lane
    let best: { a: any, dt: number } | null = null;
    for (const a of this.tiles) {
      if (a.hit) continue;
      if (a.note.lane !== lane) continue;
      const dt = Math.abs(a.y - hitLine);
      if (best === null || dt < best.dt) best = { a, dt };
    }
    if (!best) return;

    const a = best.a as any;
    const noteTime = a.note.t;
    const realT = this.time;
    const err = Math.abs(realT - noteTime);
    // Determine grade
    let grade: 'perfect' | 'great' | 'good' | 'miss' = 'miss';
    if (err <= this.hitWindows.perfect) grade = 'perfect';
    else if (err <= this.hitWindows.great) grade = 'great';
    else if (err <= this.hitWindows.good) grade = 'good';

    if (grade === 'miss') {
      this.combo = 0;
      this.stats.miss++;
      return;
    }
    a.hit = true;
    if (grade === 'perfect') { this.stats.perfect++; this.combo++; this.score += 100 * this.mult(); }
    if (grade === 'great')   { this.stats.great++;   this.combo++; this.score += 70  * this.mult(); }
    if (grade === 'good')    { this.stats.good++;    this.combo++; this.score += 40  * this.mult(); }

    // Haptics light
    if ('vibrate' in navigator) { try { navigator.vibrate(5); } catch {} }

    // Pop effect (simple overlay)
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.style.position = 'fixed';
    ov.style.left = '0'; ov.style.top = '0'; ov.style.width = '100%'; ov.style.height = '100%';
    ov.style.pointerEvents = 'none';
    ov.style.transition = 'opacity 180ms ease';
    ov.style.opacity = '1';
    ov.innerHTML = `<div style="position:absolute; left:${(x/dpr)-20}px; top:${(y/dpr)-20}px; width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.15);"></div>`;
    document.body.appendChild(ov);
    setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 180); }, 10);
  }

  mult() {
    if (this.combo >= 100) return 4;
    if (this.combo >= 60) return 3;
    if (this.combo >= 30) return 2;
    if (this.combo >= 10) return 1.5;
    return 1;
  }
}
