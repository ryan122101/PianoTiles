
import { Router, Scene } from '../ui/router';

export class ResultsScene implements Scene {
  id: 'results' = 'results';
  data: any;
  constructor(private router: Router) {}
    saveDone = false;
  enter(data?: any) {
    this.data = data || {};
    const { score=0, accuracy=0, perfect=0, great=0, good=0, miss=0, title='', mode='song', combo=0 } = this.data;
      // Stars (0-3)
      const stars = (accuracy>=95 && combo>=120) ? 3 : (accuracy>=90 && combo>=80) ? 2 : (accuracy>=80 && combo>=40) ? 1 : 0;
    const el = this.router.overlay;
    el.innerHTML = `
      <div class="glass center">
        <div class="title">Résultats</div><div id="stars" style="font-size:28px;margin-bottom:8px"></div>
        <div class="subtitle">${title}</div>
        <div class="score">${score}</div>
        <div class="row">
          <span class="chip">Précision ${accuracy.toFixed(1)}%</span>
          <span class="chip">Perfect ${perfect}</span>
          <span class="chip">Great ${great}</span>
          <span class="chip">Good ${good}</span>
          <span class="chip">Miss ${miss}</span>
        </div>
        <div class="row">
          <button class="btn" id="retry">Rejouer</button>
          <button class="btn" id="select">Choisir une autre piste</button>
        </div>
      </div>`;
      const starsEl = document.getElementById('stars');
      if (starsEl) { starsEl.textContent = '★'.repeat(stars) + '☆'.repeat(3-stars); }
      // Unlock themes (wrap in async IIFE to use await safely)
      (async () => { 
      try {
        const {Store} = await import('../ui/store');
        const unlocks = Store.get<Record<string,boolean>>('unlocks', {});
        if (stars>=2 || combo>=80) unlocks['theme_aurora'] = true;
        if (stars>=3 || combo>=120) unlocks['theme_obsidian'] = true;
        Store.set('unlocks', unlocks);
      } catch {}
    })();
    document.getElementById('retry')?.addEventListener('click', () => {
      this.router.goto('play', this.data.replayArgs || {});
    });
    document.getElementById('select')?.addEventListener('click', () => {
      this.router.goto('select');
    });
  }
  exit() { this.router.overlay.innerHTML = ''; }
  update(_: number) {}
  render(_: CanvasRenderingContext2D) {}
  onPointer() {}
}
