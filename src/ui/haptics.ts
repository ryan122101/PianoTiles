
import { getAudio } from '../audio/context';
import { Store } from './store';

export function hapticsEnabled(): boolean {
  return Store.get<boolean>('haptics', true);
}
export function setHaptics(on: boolean) {
  Store.set('haptics', on);
}

function canVibrate(): boolean {
  // Most Android browsers support navigator.vibrate; iOS Safari generally doesn't.
  // We still feature-detect only.
  return typeof navigator !== 'undefined' && typeof (navigator as any).vibrate === 'function';
}

export function haptic(kind: 'perfect'|'great'|'good'|'miss'|'milestone'|'start'='good') {
  if (!hapticsEnabled()) return;
  if (canVibrate()) {
    const pattern: Record<string, number[]|number> = {
      perfect: [8, 12, 8],
      great: [10],
      good: [6],
      miss: [0, 25],
      milestone: [15, 30, 15],
      start: [12]
    };
    try { (navigator as any).vibrate(pattern[kind] || 8); } catch {}
    return;
  }
  // Fallback "audio haptic" (tiny thump) for platforms without Vibration API (e.g., iOS Safari)
  try {
    const ctx = getAudio();
    const t = ctx.currentTime + 0.001;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 120; // low thump
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.07);
  } catch {}
}
