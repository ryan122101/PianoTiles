
import { Router, Scene } from '../ui/router';
import { getAudio, resumeAudio } from '../audio/context';
import { scheduleTick } from '../audio/sfx';
import { Store } from '../ui/store';

export class CalibrateScene implements Scene {
  id: 'calibrate' = 'calibrate';
  private scheduled: number[] = []; // times (sec)
  private running = false;
  private stopAt = 0;
  private hits: number[] = []; // offsets in ms
  private lastBeatIdx = -1;

  constructor(private router: Router) {}

  enter() {
    this.router.overlay.innerHTML = `
      <div class="glass" style="max-width:560px">
        <div class="title">Calibration de latence</div>
        <div class="subtitle">Au bip visuel/sonore, <b>tape l'écran</b>. On calcule l'offset moyen.</div>
        <div class="row">
          <button class="btn" id="start">Démarrer (10 bips)</button>
          <button class="btn" id="back">Retour</button>
        </div>
        <div class="subtitle">Astuce : mets le volume raisonnable. Un offset positif = tu tapes <i>en retard</i>.</div>
        <div id="res" class="subtitle"></div>
      </div>
    `;
    document.getElementById('start')?.addEventListener('click', () => this.start());
    document.getElementById('back')?.addEventListener('click', () => this.router.goto('menu'));
  }
  exit() { this.running = false; this.router.overlay.innerHTML=''; }

  update(_: number) {}
  render(ctx: CanvasRenderingContext2D) {
    const c = ctx.canvas;
    const dpr = (c as any).__dpr || 1;
    const W = c.width, H = c.height;
    // flashing circle synced with upcoming beat
    if (!this.running) return;
    const ctxAudio = getAudio();
    const now = ctxAudio.currentTime;
    // Nearest future beat time
    const upcoming = this.scheduled.find(t => t >= now);
    if (!upcoming) return;
    const dt = upcoming - now; // seconds
    const progress = 1 - Math.min(1, Math.max(0, dt / 0.8));
    const r = 40 * dpr + progress * 30 * dpr;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.45 * progress;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(W/2, H/2, r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  onPointer(type: 'down'|'move'|'up', x: number, y: number, id: number) {
    if (type !== 'down' || !this.running) return;
    const ctxAudio = getAudio();
    const now = ctxAudio.currentTime;
    // find nearest scheduled within 200ms window
    let nearest: number | null = null;
    for (const t of this.scheduled) {
      if (Math.abs(now - t) < 0.2 && (nearest === null || Math.abs(now - t) < Math.abs(now - nearest))) nearest = t;
    }
    if (nearest !== null) {
      const offsetMs = (now - nearest) * 1000;
      this.hits.push(offsetMs);
      const res = document.getElementById('res');
      if (res) res.textContent = `Taps: ${this.hits.length}/10, dernier offset: ${offsetMs.toFixed(1)} ms`;
    }
  }

  async start() {
    await resumeAudio();
    const ctx = getAudio();
    this.hits = [];
    this.scheduled = [];
    this.running = true;
    const start = ctx.currentTime + 0.8;
    const interval = 0.8; // seconds
    for (let i=0;i<10;i++) {
      const t = start + i*interval;
      this.scheduled.push(t);
      scheduleTick(t);
    }
    this.stopAt = start + 10*interval + 0.2;
    setTimeout(() => this.finish(), (this.stopAt - ctx.currentTime) * 1000 + 50);
  }

  finish() {
    this.running = false;
    if (this.hits.length >= 3) {
      const sorted = this.hits.slice().sort((a,b)=>a-b);
      const median = sorted[Math.floor(sorted.length/2)];
      Store.set('offsetMs', median);
      const res = document.getElementById('res');
      if (res) res.innerHTML = `✅ Offset moyen enregistré : <b>${median.toFixed(1)} ms</b>.`;
    } else {
      const res = document.getElementById('res');
      if (res) res.textContent = `Pas assez de taps. Recommence.`;
    }
  }
}
