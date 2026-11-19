// Local state only: earned ticks, per-trophy notes, spoiler mode and filters.
// Nothing leaves the device; export/import is a plain JSON file.
const KEY = 'leonida-platinum-v4';

function blank() {
  return { earned: {}, notes: {}, spoiler: false, q: '', kind: 'all', grade: 'all', hideEarned: false, view: 'tracker' };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return { ...blank(), ...parsed, earned: parsed.earned || {}, notes: parsed.notes || {} };
  } catch {
    return blank();
  }
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function exportState(s) {
  return JSON.stringify({ app: 'leonida-platinum-v4', exported: new Date().toISOString(), earned: s.earned, notes: s.notes }, null, 2);
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('not a Leonida Platinum export');
  const out = blank();
  if (parsed.earned && typeof parsed.earned === 'object') out.earned = parsed.earned;
  if (parsed.notes && typeof parsed.notes === 'object') out.notes = parsed.notes;
  return out;
}
