
import { getAudio } from './context';

export function scheduleTick(time: number) {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.3, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(time); osc.stop(time + 0.12);
}
