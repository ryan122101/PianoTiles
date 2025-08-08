
import { Store } from './store';

export type Theme = 'dark'|'aurora'|'obsidian';

export function currentTheme(): Theme {
  return Store.get<Theme>('theme', 'dark');
}

export function applyTheme(t?: Theme) {
  const theme = t || currentTheme();
  const root = document.documentElement;
  root.classList.remove('theme-aurora','theme-obsidian');
  if (theme === 'aurora') root.classList.add('theme-aurora');
  if (theme === 'obsidian') root.classList.add('theme-obsidian');
  Store.set('theme', theme);
}

export function cycleTheme(unlocks: Record<string, boolean>) {
  const order: Theme[] = ['dark','aurora','obsidian'];
  let t = currentTheme();
  let idx = order.indexOf(t);
  for (let i=1;i<=order.length;i++){
    const next = order[(idx+i)%order.length];
    if (next==='dark' || unlocks['theme_'+next]) {
      applyTheme(next);
      return next;
    }
  }
  return t;
}
