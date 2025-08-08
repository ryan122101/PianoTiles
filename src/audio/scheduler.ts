
import { getAudio, resumeAudio } from './context';
import { scheduleNote } from './synth';

export type ChartNote = { t: number; midi?: number; type?: 'tap'|'hold'; dur?: number; lane: number; };

export class AudioScheduler {
  private notes: ChartNote[] = [];
  private idx = 0;
  private timer: number | null = null;
  private startSec = 0;

  constructor(private lookAhead = 0.10, private tick = 25/1000) {}

  async start(chart: ChartNote[], startDelaySec = 0.75) {
    await resumeAudio();
    const ctx = getAudio();
    this.notes = chart.slice().sort((a,b)=>a.t-b.t);
    this.idx = 0;
    this.startSec = ctx.currentTime + startDelaySec;
    this.loop = this.loop.bind(this);
    this.timer = window.setInterval(this.loop, this.tick * 1000);
  }

  getStartTimeSec() { return this.startSec; }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  private loop() {
    const ctx = getAudio();
    const ahead = ctx.currentTime + this.lookAhead;
    while (this.idx < this.notes.length) {
      const n = this.notes[this.idx];
      const when = this.startSec + (n.t / 1000);
      if (when <= ahead) {
        scheduleNote({ time: when, midi: n.midi ?? 69, type: (n.type||'tap'), durMs: n.dur ?? 0 });
        this.idx++;
      } else {
        break;
      }
    }
  }
}
