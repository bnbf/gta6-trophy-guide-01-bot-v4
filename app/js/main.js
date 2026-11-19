// Boot + hash router + delegated events for the tracker app.
import { loadData } from './data.js';
import { loadState, saveState, exportState, importState } from './store.js';
import { renderAudit, renderProgress, renderTracker, refreshList, renderRoadmap, renderMissables, renderDetail, nextUpHtml } from './views.js';

const mount = document.getElementById('view');
const auditEl = document.getElementById('audit');
const progressEl = document.getElementById('progress');
const navEl = document.getElementById('nav');

let data = null;
let state = loadState();
let detailId = null;

function refreshHeader() {
  renderAudit(data, state, auditEl);
  renderProgress(data, state, progressEl);
}

function currentView() {
  const h = (location.hash || '#/tracker').replace(/^#\//, '');
  return ['tracker', 'roadmap', 'missables'].includes(h) ? h : 'tracker';
}

function show() {
  const v = currentView();
  state.view = v;
  saveState(state);
  navEl.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.view === v));
  detailId = null;
  if (v === 'tracker') renderTracker(data, state, mount);
  else if (v === 'roadmap') renderRoadmap(data, state, mount);
  else renderMissables(data, state, mount);
  refreshHeader();
}

function setEarned(id, on) {
  if (on) state.earned[id] = true; else delete state.earned[id];
  saveState(state);
  refreshHeader();
  // Update the row in place; do not re-render the list under the click.
  const row = mount.querySelector(`.trow[data-id="${id}"]`);
  if (row) {
    row.classList.toggle('earned', !!on);
    const box = row.querySelector('input[type=checkbox]');
    if (box) box.checked = !!on;
  }
  if (currentView() === 'tracker') {
    // Next-up depends on earned state; rebuild only that block.
    const next = mount.querySelector('#nextup');
    if (next) next.innerHTML = nextUpHtml(data, state);
    if (detailId === id) renderDetail(data, state, mount, id);
  }
}

function wire() {
  if (mount.dataset.wired) return;
  mount.dataset.wired = '1';

  mount.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.matches('input[type=checkbox][data-act="toggle"]')) {
      const row = el.closest('.trow');
      setEarned(Number(row.dataset.id), el.checked);
      return;
    }
    if (el.id === 'grade') { state.grade = el.value; saveState(state); refreshList(data, state, mount); return; }
    if (el.id === 'hideEarned') { state.hideEarned = el.checked; saveState(state); refreshList(data, state, mount); return; }
    if (el.id === 'spoiler') { state.spoiler = el.checked; saveState(state); show(); return; }
    if (el.id === 'importFile' && el.files && el.files[0]) {
      const file = el.files[0];
      file.text().then((text) => {
        try {
          state = { ...state, ...importState(text) };
          saveState(state);
          show();
        } catch (err) { alert('That file is not a Leonida Platinum export.'); }
      });
    }
  });

  mount.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.id === 'q') { state.q = el.value; saveState(state); refreshList(data, state, mount); return; }
    if (el.matches('textarea[data-note]')) {
      const id = Number(el.dataset.note);
      if (el.value) state.notes[id] = el.value; else delete state.notes[id];
      saveState(state);
    }
  });

  mount.addEventListener('click', (ev) => {
    const el = ev.target;
    const chip = el.closest('.chip[data-kind]');
    if (chip) {
      state.kind = chip.dataset.kind;
      saveState(state);
      mount.querySelectorAll('.chip[data-kind]').forEach((b) => b.classList.toggle('on', b === chip));
      refreshList(data, state, mount);
      return;
    }
    if (el.closest('input,button,select,textarea,a')) {
      const btn = el.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'export') {
        const blob = new Blob([exportState(state)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'leonida-platinum-save.json';
        a.click();
        URL.revokeObjectURL(a.href);
      } else if (act === 'import') {
        mount.querySelector('#importFile').click();
      } else if (act === 'toggle-detail') {
        const id = Number(btn.dataset.id);
        setEarned(id, !state.earned[id]);
      } else if (act === 'close-detail') {
        const box = mount.querySelector('#detail');
        if (box) box.innerHTML = '';
        detailId = null;
      }
      return;
    }
    const row = el.closest('.trow');
    if (row && currentView() === 'tracker') {
      detailId = Number(row.dataset.id);
      renderDetail(data, state, mount, detailId);
    }
  });
}

window.addEventListener('hashchange', show);

loadData().then((d) => {
  data = d;
  wire();
  show();
}).catch((err) => {
  mount.innerHTML = '<p class="empty">The trophy data could not be loaded. Reload the page.</p>';
  console.error(err);
});
