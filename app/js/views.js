// Renders the tracker, roadmap and missable-watch views.
// Row clicks ignore inputs/buttons/links (a re-render must never eat a tick),
// and checkbox changes update the row in place — the list is not re-rendered
// under the user's click.
import { STAGES, KIND_LABEL, GRADE_LABEL } from './data.js';
import { visibleTrophies, nextUp, stageCounts, totals } from './filters.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function masked(t, s) {
  return s.spoiler && !s.earned[t.id] && (t.kind === 'story' || t.id === 1);
}

function showName(t, s) {
  if (!masked(t, s)) return t.name;
  return t.id === 1 ? 'Hidden platinum trophy' : 'Hidden story trophy';
}

function gradeBadge(t) {
  return `<span class="badge b-${t.grade}">${esc(GRADE_LABEL[t.grade])}</span>`;
}

function rowHtml(t, s, compact) {
  const m = masked(t, s);
  const name = esc(showName(t, s));
  const desc = m ? 'Spoiler hidden — earn this trophy to reveal it.' : esc(t.description);
  const fact = m ? '' : `<div class="fact">Key fact: ${esc(t.fact)}</div>`;
  const srcs = `<div class="srcs">Sources: ${t.sources.map(esc).join(' · ')}</div>`;
  const miss = t.missable ? '<span class="badge b-miss">MISSABLE — WATCH</span>' : '';
  const checked = s.earned[t.id] ? 'checked' : '';
  const cls = s.earned[t.id] ? 'trow earned' : 'trow';
  return `<li class="${cls}" data-id="${t.id}">
    <input type="checkbox" data-act="toggle" ${checked} aria-label="Mark ${name} earned">
    <div class="body">
      <div class="name">${name}</div>
      <div class="desc">${desc}</div>
      ${compact ? '' : fact}
      <div class="meta">${gradeBadge(t)}
        <span class="badge b-pts">${t.points} pts</span>
        <span class="badge b-kind">${esc(KIND_LABEL[t.kind])}</span>
        <span class="badge b-stage">Stage ${t.stage}</span>${miss}</div>
      ${compact ? '' : srcs}
    </div>
  </li>`;
}

export function renderAudit(data, s, el) {
  const tot = totals(data, s);
  el.innerHTML = `<span><b>55</b> official trophies</span>
    <span>1 platinum / 2 gold / 6 silver / 46 bronze</span>
    <span>List checked <b>19 Nov 2026</b> vs Exophase</span>
    <span class="ok">0 missing · 0 blank guides</span>
    <span><b>1,230</b> PSN points total</span>
    <span>Earned <b>${tot.earned}/55</b> · <b>${tot.pointsEarned} pts</b></span>`;
}

export function renderProgress(data, s, el) {
  const tot = totals(data, s);
  const pct = tot.total ? Math.round((tot.earned / tot.total) * 100) : 0;
  el.innerHTML = `<div class="bar"><div class="fill" style="width:${pct}%"></div></div>
    <div class="nums"><span>${tot.earned} / ${tot.total} trophies earned (${pct}%)</span><span>${tot.pointsEarned} / ${tot.points} PSN points</span></div>`;
}

export function nextUpHtml(data, s) {
  const list = nextUp(data, s);
  if (!list.length) return `<section class="nextup"><h2>Platinum earned</h2><p>All 55 trophies are ticked. The platinum is yours.</p></section>`;
  const items = list.map((t) => {
    const name = esc(showName(t, s));
    const why = masked(t, s) ? 'Story trophy — hidden while spoiler mode is on.' : esc(t.fact);
    return `<li><b>${name}</b> <span class="why">— ${why} (Stage ${t.stage}, ${t.points} pts)</span></li>`;
  }).join('');
  return `<section class="nextup"><h2>Next up</h2><p class="why">Your next three trophies in roadmap order. Earn the missable ones the first time they appear.</p><ol>${items}</ol></section>`;
}

function toolbarHtml(s) {
  const kinds = [['all', 'All kinds'], ['story', 'Story'], ['activities', 'Activities'], ['collectibles', 'Collectibles'], ['missable', 'Missable']];
  const grades = [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']];
  return `<div class="toolbar">
    <input type="search" id="q" placeholder="Search name, guide or fact — try “shooting”" value="${esc(s.q || '')}" aria-label="Search trophies">
    ${kinds.map(([v, l]) => `<button class="chip${s.kind === v ? ' on' : ''}" data-kind="${v}">${l}</button>`).join('')}
    <select id="grade" aria-label="Grade filter">${grades.map(([v, l]) => `<option value="${v}"${s.grade === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
    <label class="check"><input type="checkbox" id="hideEarned"${s.hideEarned ? ' checked' : ''}> Hide earned</label>
    <label class="check"><input type="checkbox" id="spoiler"${s.spoiler ? ' checked' : ''}> Spoiler mode</label>
  </div>`;
}

export function renderTracker(data, s, mount) {
  mount.innerHTML = `<h2>Trophy tracker</h2>
    <p class="muted">Tick a trophy when you earn it. Click a row for the full guide, its sources and a note field. Search looks through names, descriptions, guides and key facts.</p>
    <div id="nextup">${nextUpHtml(data, s)}</div>
    ${toolbarHtml(s)}
    <div>
      <button class="btn" data-act="export">Export save (JSON)</button>
      <button class="btn" data-act="import">Import save</button>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </div>
    <ul class="tlist" id="tlist"></ul>
    <div id="detail"></div>`;
  refreshList(data, s, mount);
}

export function refreshList(data, s, mount) {
  const list = mount.querySelector('#tlist');
  if (!list) return;
  const rows = visibleTrophies(data, s);
  list.innerHTML = rows.length
    ? rows.map((t) => rowHtml(t, s, false)).join('')
    : '<li class="empty">No trophies match these filters. Clear the search or pick another kind.</li>';
}

export function renderRoadmap(data, s, mount) {
  const counts = stageCounts(data, s);
  const sections = STAGES.map((st) => {
    const c = counts[st.n] || { total: 0, earned: 0, points: 0, pointsEarned: 0 };
    const pct = c.total ? Math.round((c.earned / c.total) * 100) : 0;
    const items = data.trophies.filter((t) => t.stage === st.n)
      .sort((a, b) => a.id - b.id)
      .map((t) => rowHtml(t, s, true)).join('');
    return `<section class="stage"><h3>${esc(st.title)}</h3>
      <p class="muted">${esc(st.blurb)}</p>
      <div class="count">${c.earned}/${c.total} earned · ${c.pointsEarned}/${c.points} pts</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <ul class="tlist">${items}</ul></section>`;
  }).join('');
  mount.innerHTML = `<h2>Platinum roadmap</h2>
    <p class="muted">All 55 trophies, grouped by stage, each with its key fact. Work the stages in order — the missable watch list (Stage 5) goes before the final mission in Stage 1, because the story may not let you go back.</p>
    ${sections}`;
}

export function renderMissables(data, s, mount) {
  const cards = data.trophies.filter((t) => t.missable).map((t) => {
    const m = masked(t, s);
    const name = esc(showName(t, s));
    const desc = m ? 'Spoiler hidden — earn this trophy to reveal it.' : esc(t.description);
    const guide = m ? 'Spoiler hidden.' : esc(t.guide);
    return `<article class="misscard"><h3>${name} ${gradeBadge(t)} <span class="badge b-pts">${t.points} pts</span></h3>
      <p>${desc}</p>
      <p>${guide}</p>
      <p class="caveat">WATCH: do this the first time the moment appears. Our reading is that it may not come back — the trigger is unconfirmed, the game released 19 Nov 2026.</p>
      <p class="srcs">Sources: ${t.sources.map(esc).join(' · ')}</p></article>`;
  }).join('');
  mount.innerHTML = `<h2>Missable Watch</h2>
    <p class="muted">7 trophies flagged from the wording of their official descriptions. Each guide states plainly that the flag is our reading and the trigger is unconfirmed — the game is one day old and no source has pinned the triggers down yet.</p>
    ${cards}`;
}

export function renderDetail(data, s, mount, id) {
  const t = data.trophies.find((x) => x.id === id);
  const box = mount.querySelector('#detail');
  if (!t || !box) return;
  const m = masked(t, s);
  const name = esc(showName(t, s));
  const desc = m ? 'Spoiler hidden — earn this trophy to reveal it.' : esc(t.description);
  const guide = m ? 'Spoiler hidden.' : esc(t.guide);
  const note = esc(s.notes[t.id] || '');
  box.innerHTML = `<section class="detail"><h2>${name}</h2>
    <div class="meta">${gradeBadge(t)}
      <span class="badge b-pts">${t.points} pts</span>
      <span class="badge b-kind">${esc(KIND_LABEL[t.kind])}</span>
      <span class="badge b-stage">Stage ${t.stage}</span>
      ${t.missable ? '<span class="badge b-miss">MISSABLE — WATCH</span>' : ''}</div>
    <p><b>Official description:</b> ${desc}</p>
    ${m ? '' : `<p><b>Key fact:</b> ${esc(t.fact)}</p>`}
    <p class="guide"><b>Guide:</b> ${guide}</p>
    <p class="srcs">Sources: ${t.sources.map(esc).join(' · ')}</p>
    <label for="note">Your note</label>
    <textarea id="note" data-note="${t.id}" placeholder="e.g. 31/42 range challenges gold">${note}</textarea>
    <p><button class="btn primary" data-act="toggle-detail" data-id="${t.id}">${s.earned[t.id] ? 'Mark not earned' : 'Mark earned'}</button>
    <button class="btn" data-act="close-detail">Close</button></p></section>`;
  box.scrollIntoView({ block: 'nearest' });
}
