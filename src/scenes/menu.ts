
import { Router, Scene } from '../ui/router';

export class MenuScene implements Scene {
  id: 'menu' = 'menu';
  constructor(private router: Router) {}
  enter() {
      import('../ui/theme').then(m=>m.applyTheme());
      import('../ui/haptics').then(async (m)=>{
        const b = document.getElementById('hapt') as HTMLButtonElement;
        if (b) b.textContent = m.hapticsEnabled() ? 'Haptics: ON' : 'Haptics: OFF';
      });
    const el = this.router.overlay;
    el.innerHTML = `
      <div class="glass center">
        <div class="title">Piano Tiles Premium</div>
        <div class="subtitle">Ultra fluide • Visuel premium • Jouable hors-ligne</div>
        <button class="btn" id="play">Jouer</button>
        <div class="row">
          <span class="chip">60/120 fps</span>
          <span class="chip">Haptics</span>
          <span class="chip">Latence calibrable</span>
        </div>
      </div>`;
    const btn = document.getElementById('play');
    btn?.addEventListener('click', () => this.router.goto('select'));
      document.getElementById('modes')?.addEventListener('click', ()=> this.router.goto('select', {modePicker: true}));
      document.getElementById('cal')?.addEventListener('click', ()=> this.router.goto('calibrate'));
      document.getElementById('theme')?.addEventListener('click', async ()=> {
        const mod = await import('../ui/theme');
        const {Store} = await import('../ui/store');
        const unlocks = Store.get<Record<string,boolean>>('unlocks', {});
        const t = mod.cycleTheme(unlocks);
        const b = document.getElementById('theme') as HTMLButtonElement;
        if (b) b.textContent = 'Thème: ' + (t==='dark'?'Neo-Dark':(t==='aurora'?'Aurora':'Obsidian'));
      });
      document.getElementById('hapt')?.addEventListener('click', async ()=> {
        const { hapticsEnabled, setHaptics, haptic } = await import('../ui/haptics');
        const on = !hapticsEnabled(); setHaptics(on);
        const b = document.getElementById('hapt') as HTMLButtonElement;
        if (b) b.textContent = on ? 'Haptics: ON' : 'Haptics: OFF';
        if (on) haptic('start');
      });
  }
  exit() { this.router.overlay.innerHTML = ''; }
  update(_: number) {}
  render(_: CanvasRenderingContext2D) {}
  onPointer() {}
}
