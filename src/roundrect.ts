
export function patchRoundRect(ctx: CanvasRenderingContext2D) {
  if (typeof (ctx as any).roundRect === 'function') return;
  (CanvasRenderingContext2D.prototype as any).roundRect = function(x:number,y:number,w:number,h:number,r:number|number[]) {
    const rr = Array.isArray(r) ? r : [r,r,r,r];
    this.beginPath();
    this.moveTo(x+rr[0], y);
    this.lineTo(x+w-rr[1], y);
    this.quadraticCurveTo(x+w, y, x+w, y+rr[1]);
    this.lineTo(x+w, y+h-rr[2]);
    this.quadraticCurveTo(x+w, y+h, x+w-rr[2], y+h);
    this.lineTo(x+rr[3], y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-rr[3]);
    this.lineTo(x, y+rr[0]);
    this.quadraticCurveTo(x, y, x+rr[0], y);
    this.closePath();
  };
}
