
let _ctx: AudioContext | null = null;

export function getAudio(): AudioContext {
  if (_ctx) return _ctx;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  _ctx = new AC();
  return _ctx!;
}

export async function resumeAudio(): Promise<void> {
  const ctx = getAudio();
  if (ctx.state !== 'running') {
    try { await ctx.resume(); } catch {}
  }
}
