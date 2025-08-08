
import { MenuScene } from './scenes/menu';
import { SongSelectScene } from './scenes/songSelect';
import { GameplayScene } from './scenes/gameplay';
import { ResultsScene } from './scenes/results';
import { CalibrateScene } from './scenes/calibrate';
import { Router } from './ui/router';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
if (!canvas) throw new Error('canvas not found');

// DPR handling
const ctx = canvas.getContext('2d', { alpha: false });
  import('./roundrect').then(m=>m.patchRoundRect(ctx!));
if (!ctx) throw new Error('no 2d ctx');

function resize() {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  (canvas as any).__dpr = dpr;
}
window.addEventListener('resize', resize, { passive: true });
resize();

// Router/Scenes
const router = new Router({ canvas, overlay });
router.register('menu', new MenuScene(router));
router.register('select', new SongSelectScene(router));
router.register('play', new GameplayScene(router));
router.register('results', new ResultsScene(router));
  router.register('calibrate', new CalibrateScene(router));

router.goto('menu');

// PWA SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  });
}
