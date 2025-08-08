
import { getAudio } from './context';

function midiToFreq(m: number) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export type NoteParams = {
  time: number;    // ctx.currentTime seconds
  midi?: number;   // default 69 (A4)
  durMs?: number;  // for holds, optional
  velocity?: number; // 0..1
  type?: 'tap' | 'hold';
};

export function scheduleNote(p: NoteParams) {
  const ctx = getAudio();
  const midi = p.midi ?? 69;
  const f = midiToFreq(midi);
  const v = Math.min(1, Math.max(0, p.velocity ?? 0.85));

  // Nodes
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  const comp = ctx.createDynamicsCompressor();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc2.detune.value = 6; // slight detune for richness

  lp.type = 'lowpass';
  lp.frequency.value = 4200;
  lp.Q.value = 0.6;

  comp.threshold.value = -12;
  comp.knee.value = 24;
  comp.ratio.value = 2.5;
  comp.attack.value = 0.003;
  comp.release.value = 0.09;

  osc1.frequency.setValueAtTime(f, p.time);
  osc2.frequency.setValueAtTime(f*2, p.time); // gentle 2nd harmonic

  // Envelope (simple piano-ish)
  const atk = 0.003;
  const dec = 0.18;
  const sus = (p.type === 'hold') ? 0.25 : 0.0;
  const rel = 0.14;
  const start = p.time;
  const durSec = (p.durMs ?? 0) / 1000;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, v), start + atk);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0008, v*0.6 + sus*0.4), start + atk + dec);

  const end = start + (p.type === 'hold' ? durSec : 0.04);
  // Sustain (for hold): keep level, else start release quickly
  if (p.type === 'hold' && durSec > 0) {
    gain.gain.setTargetAtTime(Math.max(0.0008, v*0.25), end, 0.05);
  }

  // Release
  const stopAt = end + rel;
  gain.gain.setTargetAtTime(0.0001, end, 0.08);

  // Routing
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(lp);
  lp.connect(comp);
  comp.connect(ctx.destination);

  osc1.start(start);
  osc2.start(start);
  osc1.stop(stopAt);
  osc2.stop(stopAt);
}
