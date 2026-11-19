// Filtering and ordering for the tracker list and the Next-up planner.

export function visibleTrophies(data, s) {
  const q = (s.q || '').trim().toLowerCase();
  return data.trophies.filter((t) => {
    if (s.hideEarned && s.earned[t.id]) return false;
    if (s.kind === 'missable') { if (!t.missable) return false; }
    else if (s.kind !== 'all' && t.kind !== s.kind) return false;
    if (s.grade !== 'all' && t.grade !== s.grade) return false;
    if (!q) return true;
    const hay = [t.name, t.description, t.guide, t.fact, t.kind, t.grade].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

export function nextUp(data, s) {
  const order = [...data.trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return order.filter((t) => !s.earned[t.id]).slice(0, 3);
}

export function stageCounts(data, s) {
  const out = {};
  for (const t of data.trophies) {
    out[t.stage] = out[t.stage] || { total: 0, earned: 0, points: 0, pointsEarned: 0 };
    out[t.stage].total += 1;
    out[t.stage].points += t.points;
    if (s.earned[t.id]) { out[t.stage].earned += 1; out[t.stage].pointsEarned += t.points; }
  }
  return out;
}

export function totals(data, s) {
  let earned = 0, points = 0, pointsEarned = 0;
  for (const t of data.trophies) {
    points += t.points;
    if (s.earned[t.id]) { earned += 1; pointsEarned += t.points; }
  }
  return { total: data.trophies.length, earned, points, pointsEarned };
}
