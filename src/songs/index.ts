
export type SongMeta = {
  title: string;
  composer: string;
  bpm: number;
  timeSignature: string;
  file: string;
  offsetMs?: number;
};

export const SONGS: SongMeta[] = [
  { title: 'Für Elise', composer: 'Beethoven', bpm: 120, timeSignature: '3/4', file: 'fur_elise.json', offsetMs: 0 },
  { title: 'Prelude in C', composer: 'Bach', bpm: 96, timeSignature: '4/4', file: 'bach_prelude_c.json', offsetMs: 0 },
  { title: 'Rondo Alla Turca', composer: 'Mozart', bpm: 132, timeSignature: '4/4', file: 'rondo_turca.json', offsetMs: 0 },
  { title: 'Clair de Lune', composer: 'Debussy', bpm: 72, timeSignature: '3/4', file: 'clair_de_lune.json', offsetMs: 0 },
  { title: 'Nocturne Op.9 No.2', composer: 'Chopin', bpm: 78, timeSignature: '4/4', file: 'nocturne_op9_2.json', offsetMs: 0 },
  { title: 'Maple Leaf Rag', composer: 'Joplin', bpm: 92, timeSignature: '2/4', file: 'maple_leaf_rag.json', offsetMs: 0 },
  { title: 'Canon in D', composer: 'Pachelbel', bpm: 84, timeSignature: '4/4', file: 'canon_in_d.json', offsetMs: 0 },
  { title: 'In the Hall of the Mountain King', composer: 'Grieg', bpm: 124, timeSignature: '4/4', file: 'mountain_king.json', offsetMs: 0 },
  { title: 'Dance of the Sugar Plum Fairy', composer: 'Tchaikovsky', bpm: 110, timeSignature: '2/4', file: 'sugar_plum.json', offsetMs: 0 },
  { title: 'Flight of the Bumblebee', composer: 'Rimsky-Korsakov', bpm: 160, timeSignature: '2/4', file: 'bumblebee.json', offsetMs: 0 },
];

export async function loadSongChart(name: string): Promise<any> {
  const res = await fetch('/src/songs/' + name);
  return res.json();
}
