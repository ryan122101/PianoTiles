
export type SceneID = 'menu' | 'select' | 'play' | 'results' | 'calibrate';

export interface Scene {
  id: SceneID;
  enter(data?: any): void;
  exit(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  onPointer(type: 'down'|'move'|'up', x: number, y: number, id: number): void;
}

export class Router {
  canvas: HTMLCanvasElement;
  overlay: HTMLDivElement;
  scenes: Map<SceneID, Scene> = new Map();
  current: Scene | null = null;
  lastTime = performance.now();
  pointers = new Map<number, {x:number,y:number}>();

  constructor(opts: { canvas: HTMLCanvasElement; overlay: HTMLDivElement; }) {
    this.canvas = opts.canvas;
    this.overlay = opts.overlay;
    this.bindInputs();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  register(id: SceneID, scene: Scene) {
    this.scenes.set(id, scene);
  }
  goto(id: SceneID, data?: any) {
    this.current?.exit();
    this.current = this.scenes.get(id) || null;
    if (!this.current) throw new Error('Scene '+id+' not found');
    this.current.enter(data);
    this.renderOverlay();
  }

  loop(ts: number) {
    const dt = Math.min(32, ts - this.lastTime);
    this.lastTime = ts;
    const ctx = this.canvas.getContext('2d')!;
    this.current?.update(dt);
    ctx.save();
    ctx.fillStyle = '#0b0f12';
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.restore();
    this.current?.render(ctx);
    requestAnimationFrame(this.loop);
  }

  renderOverlay() {
    // Scene renders its own UI into overlay if needed via DOM updates
  }

  bindInputs() {
    const c = this.canvas;
    const getXY = (ev: Touch | MouseEvent) => {
      const rect = c.getBoundingClientRect();
      const dpr = (c as any).__dpr || 1;
      const x = ('clientX' in ev ? ev.clientX : 0) - rect.left;
      const y = ('clientY' in ev ? ev.clientY : 0) - rect.top;
      return { x: x * dpr, y: y * dpr };
    };
    c.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        const {x,y} = getXY(t);
        this.pointers.set(t.identifier, {x,y});
        this.current?.onPointer('down', x, y, t.identifier);
      }
    }, { passive: false });
    c.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of Array.from(e.touches)) {
        const {x,y} = getXY(t);
        this.pointers.set(t.identifier, {x,y});
        this.current?.onPointer('move', x, y, t.identifier);
      }
    }, { passive: false });
    c.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        const {x,y} = getXY(t);
        this.pointers.delete(t.identifier);
        this.current?.onPointer('up', x, y, t.identifier);
      }
    }, { passive: false });

    c.addEventListener('mousedown', (e) => {
      const {x,y} = getXY(e);
      this.pointers.set(0, {x,y});
      this.current?.onPointer('down', x, y, 0);
    });
    c.addEventListener('mousemove', (e) => {
      const {x,y} = getXY(e);
      this.pointers.set(0, {x,y});
      this.current?.onPointer('move', x, y, 0);
    });
    c.addEventListener('mouseup', (e) => {
      const {x,y} = getXY(e);
      this.pointers.delete(0);
      this.current?.onPointer('up', x, y, 0);
    });
  }
}
