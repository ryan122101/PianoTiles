
import { Store } from './store';

type ScoreEntry = { title: string; mode: string; score: number; accuracy: number; date: string; combo: number };

export function saveScore(e: ScoreEntry) {
  const all = Store.get<ScoreEntry[]>('scores', []);
  all.push(e);
  all.sort((a,b)=> b.score - a.score);
  Store.set('scores', all.slice(0, 1000));
}

export function bestFor(title: string, mode: string): ScoreEntry | null {
  const all = Store.get<ScoreEntry[]>('scores', []);
  const ms = all.filter(s => s.title === title && s.mode === mode).sort((a,b)=> b.score - a.score);
  return ms[0] || null;
}
