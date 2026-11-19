// Loads the official trophy data and holds the roadmap definitions.
let cache = null;

export async function loadData() {
  if (cache) return cache;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('trophies.json failed to load');
  cache = await res.json();
  return cache;
}

export const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1–4, the named missions and the final mission. Story only; nothing here needs a grind.' },
  { n: 2, title: 'Stage 2 — Finish everything', blurb: '100% completion plus the strands and the map. The longest single trophy in the game lives here.' },
  { n: 3, title: 'Stage 3 — Grinds with counters', blurb: 'The counted grinds: stunts, shooting range, drone races, meditation, WAiNK It, challenges, vehicles, vaults, money.' },
  { n: 4, title: 'Stage 4 — Partners & crews', blurb: 'Strand finales for Andy, Kenton, Billy, Randy and Tyrone, plus partner jobs, gangs and side contests.' },
  { n: 5, title: 'Stage 5 — Missable watch', blurb: 'The 7 watch-list trophies. Do them the first time the moment appears — our reading is that they may not come back.' },
  { n: 6, title: 'Stage 6 — Clean-up & platinum', blurb: 'Card sets, one-off tricks, garages and registrations — then the platinum pops.' },
];

export const KIND_LABEL = { story: 'Story', activities: 'Activities', collectibles: 'Collectibles' };
export const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function byId(data, id) {
  return data.trophies.find((t) => t.id === id);
}
