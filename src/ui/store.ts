
export const Store = {
  get<T>(k: string, def: T): T {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : def; } catch { return def; }
  },
  set<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
