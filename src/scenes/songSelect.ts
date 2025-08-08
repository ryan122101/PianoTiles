
import { Router, Scene } from '../ui/router';
import { SONGS } from '../songs/index';

type Mode = 'song' | 'rush' | 'endless' | 'daily';
  export class SongSelectScene implements Scene {
  id: 'select' = 'select';
  constructor(private router: Router) {}
    private mode: Mode = 'song';
  enter(data?: any) {
      if (data && data.modePicker) { /* keep default */ }
    
    const el = this.router.overlay;
    const list = SONGS.map((s, i) => `
      <div class="glass card">
        <div>
          <div style="font-weight:700">${s.title}</div>
          <div class="subtitle">${s.composer} • ${s.bpm} BPM • ${s.timeSignature}</div>
        </div>
        <button class="btn" data-i="${i}">Jouer</button>
      </div>
    `).join('');
    el.innerHTML = `
      <div class="glass">
        <div class="title">Choisis ta piste</div>
        <div class="list">${list}</div>
        <div style="margin-top:10px" class="subtitle">Astuce : ajoute à l'écran d'accueil pour jouer hors-ligne.</div>
      </div>
    `;
    el.querySelectorAll('button.btn[data-i]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = Number((e.currentTarget as HTMLElement).dataset.i);
        resumeAudio().then(()=> this.router.goto('play', { index: i, mode: this.mode }));
      });
    });
  }
  exit() { this.router.overlay.innerHTML = ''; }
  update(_: number) {}
  render(_: CanvasRenderingContext2D) {}
  onPointer() {}
}
