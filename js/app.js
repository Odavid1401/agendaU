const TYPES = ['Entrega', 'Examen', 'Clase', 'Proyecto grupal', 'Monitoría', 'Actividad', 'Otro'];
const REPEAT_DAYS = { daily: 1, weekly: 7, biweekly: 14 };
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dueAt = (t) => new Date(`${t.date}T${t.time || '23:59'}`);
const startOfWeek = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const state = { tasks: Store.load(), view: 'list', cursor: new Date(), q: '', type: '', prio: '', editing: null };
const persist = () => { Store.save(state.tasks); render(); };

/* ---------- Utilidades de tiempo ---------- */
function relative(t) {
  const ms = dueAt(t) - Date.now();
  const abs = Math.abs(ms), m = Math.round(abs / 60000), h = Math.round(abs / 3600000), d = Math.round(abs / 86400000);
  const txt = m < 60 ? `${m} min` : h < 48 ? `${h} h` : `${d} días`;
  return ms < 0 ? `Vencida hace ${txt}` : `Faltan ${txt}`;
}
function nextDate(t) {
  const d = parseDay(t.date);
  if (REPEAT_DAYS[t.repeat]) return iso(addDays(d, REPEAT_DAYS[t.repeat]));
  if (t.repeat === 'monthly') { d.setMonth(d.getMonth() + 1); return iso(d); }
  return null;
}
function filtered() {
  const q = state.q.toLowerCase();
  return state.tasks.filter((t) =>
    (!state.type || t.type === state.type) &&
    (!state.prio || t.priority === state.prio) &&
    (!q || [t.title, t.subject, t.notes, t.group].join(' ').toLowerCase().includes(q)));
}
const sortTasks = (a, b) => dueAt(a) - dueAt(b);

/* ---------- Acciones ---------- */
function toggleDone(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done && t.repeat !== 'none') {
    const nd = nextDate(t);
    if (nd) state.tasks.push({ ...t, id: uid(), date: nd, done: false, notifiedFor: null });
  }
  persist();
}
function removeTask(id) { state.tasks = state.tasks.filter((t) => t.id !== id); persist(); }

/* ---------- Render ---------- */
function taskCard(t) {
  const late = !t.done && dueAt(t) < new Date();
  const meta = [t.type, t.subject, `${t.date} · ${t.time}`, t.group && `Con ${t.group}`, t.repeat !== 'none' && 'Se repite']
    .filter(Boolean).map(esc).join(' | ');
  return `<article class="task p-${t.priority} ${t.done ? 'done' : ''} ${late ? 'late' : ''}" data-id="${t.id}">
    <input type="checkbox" ${t.done ? 'checked' : ''} aria-label="Marcar como hecha: ${esc(t.title)}" data-act="done">
    <div class="body">
      <h3>${esc(t.title)}</h3>
      <p class="meta">${meta}</p>
      ${t.notes ? `<details><summary>Ver información</summary><p>${esc(t.notes)}</p></details>` : ''}
    </div>
    <div class="side-r">
      ${t.done ? '' : `<span class="when">${relative(t)}</span>`}
      <button class="link" data-act="edit">Editar</button>
    </div>
  </article>`;
}
function renderList() {
  const now = new Date(), today = iso(now), weekEnd = iso(addDays(now, 7));
  const all = filtered().sort(sortTasks);
  const groups = [
    ['Vencidas', all.filter((t) => !t.done && dueAt(t) < now)],
    ['Hoy', all.filter((t) => !t.done && dueAt(t) >= now && t.date === today)],
    ['Próximos 7 días', all.filter((t) => !t.done && t.date > today && t.date <= weekEnd)],
    ['Más adelante', all.filter((t) => !t.done && t.date > weekEnd)],
    ['Hechas', all.filter((t) => t.done).reverse()],
  ];
  const html = groups.filter(([, l]) => l.length).map(([n, l]) =>
    `<section class="group"><h2>${n} <span>${l.length}</span></h2>${l.map(taskCard).join('')}</section>`).join('');
  return html || `<div class="empty"><h2>No hay tareas todavía</h2><p>Agrega tu primera entrega, examen o actividad con "Nueva tarea".</p></div>`;
}
function chip(t) {
  return `<button class="chip p-${t.priority} ${t.done ? 'done' : ''}" data-id="${t.id}" data-act="edit" title="${esc(t.title)}">${esc(t.time)} ${esc(t.title)}</button>`;
}
function renderWeek() {
  const start = startOfWeek(state.cursor), list = filtered().sort(sortTasks), todayIso = iso(new Date());
  $('#calTitle').textContent = `Semana del ${start.getDate()} de ${start.toLocaleDateString('es-CO', { month: 'long' })}`;
  let h = '<div class="week">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i), k = iso(d);
    h += `<div class="col ${k === todayIso ? 'today' : ''}"><header><b>${DAYS[d.getDay()]}</b> ${d.getDate()}</header>
      ${list.filter((t) => t.date === k).map(chip).join('') || '<p class="none">Libre</p>'}
      <button class="link" data-add="${k}">Agregar</button></div>`;
  }
  return h + '</div>';
}
function renderMonth() {
  const c = state.cursor, first = new Date(c.getFullYear(), c.getMonth(), 1), start = startOfWeek(first);
  $('#calTitle').textContent = c.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const list = filtered().sort(sortTasks), todayIso = iso(new Date());
  let h = '<div class="month">' + ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => `<b class="dow">${d}</b>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), k = iso(d), items = list.filter((t) => t.date === k);
    h += `<div class="cell ${d.getMonth() !== c.getMonth() ? 'other' : ''} ${k === todayIso ? 'today' : ''}" data-add="${k}">
      <span class="num">${d.getDate()}</span>${items.slice(0, 3).map(chip).join('')}${items.length > 3 ? `<small>+${items.length - 3} más</small>` : ''}</div>`;
  }
  return h + '</div>';
}
function renderLoad() {
  const today = new Date(), pending = state.tasks.filter((t) => !t.done);
  const counts = Array.from({ length: 7 }, (_, i) => pending.filter((t) => t.date === iso(addDays(today, i))).length);
  const max = Math.max(3, ...counts);
  $('#loadBars').innerHTML = counts.map((n, i) => {
    const d = addDays(today, i);
    return `<div class="bar ${n >= 3 ? 'heavy' : ''}" title="${n} pendiente(s)"><span class="n">${n}</span>
      <i style="height:${8 + (n / max) * 56}px"></i><span>${i === 0 ? 'Hoy' : DAYS[d.getDay()]}</span></div>`;
  }).join('');
}
function render() {
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.view === state.view));
  $('#calNav').hidden = state.view === 'list';
  $('#view').innerHTML = state.view === 'list' ? renderList() : state.view === 'week' ? renderWeek() : renderMonth();
  renderLoad();
}

/* ---------- Formulario ---------- */
const dlg = $('#dlg'), form = $('#form');
function openForm(task, presetDate) {
  state.editing = task ? task.id : null;
  $('#dlgTitle').textContent = task ? 'Editar tarea' : 'Nueva tarea';
  $('#delBtn').hidden = !task;
  form.reset();
  const t = task || { date: presetDate || iso(new Date()), time: '23:59', type: 'Entrega', priority: 'media', remind: 60, repeat: 'none' };
  for (const [k, v] of Object.entries(t)) if (form.elements[k] && typeof v !== 'object') form.elements[k].value = v;
  dlg.showModal();
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(form));
  const data = { ...f, title: f.title.trim(), remind: Number(f.remind), time: f.time || '23:59' };
  if (state.editing) {
    const t = state.tasks.find((x) => x.id === state.editing);
    Object.assign(t, data, { notifiedFor: null });
  } else {
    state.tasks.push({ id: uid(), done: false, notifiedFor: null, ...data });
  }
  dlg.close();
  persist();
  toast('Tarea guardada');
});
$('#cancelBtn').onclick = () => dlg.close();
$('#delBtn').onclick = () => {
  if (confirm('¿Eliminar esta tarea? No se puede deshacer.')) { removeTask(state.editing); dlg.close(); toast('Tarea eliminada'); }
};

/* ---------- Recordatorios ---------- */
function toast(msg, long) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), long ? 9000 : 2500);
}
function checkReminders() {
  const now = Date.now();
  state.tasks.forEach((t) => {
    if (t.done || t.remind < 0) return;
    const due = dueAt(t).getTime(), key = `${t.date}T${t.time}`;
    if (t.notifiedFor === key || now < due - t.remind * 60000 || now > due) return;
    t.notifiedFor = key;
    const msg = `${t.title} (${relative(t).toLowerCase()})`;
    toast(`Recordatorio: ${msg}`, true);
    if ('Notification' in window && Notification.permission === 'granted') new Notification('Agendau', { body: msg });
  });
  Store.save(state.tasks);
  render();
}

/* ---------- Eventos ---------- */
TYPES.forEach((t) => {
  form.elements.type.insertAdjacentHTML('beforeend', `<option>${t}</option>`);
  $('#fType').insertAdjacentHTML('beforeend', `<option>${t}</option>`);
});
document.querySelector('.nav').onclick = (e) => { if (e.target.dataset.view) { state.view = e.target.dataset.view; render(); } };
$('#newTask').onclick = () => openForm();
$('#q').oninput = (e) => { state.q = e.target.value; render(); };
$('#fType').onchange = (e) => { state.type = e.target.value; render(); };
$('#fPrio').onchange = (e) => { state.prio = e.target.value; render(); };
const step = (n) => {
  if (state.view === 'week') state.cursor = addDays(state.cursor, 7 * n);
  else state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + n, 1);
  render();
};
$('#prev').onclick = () => step(-1);
$('#next').onclick = () => step(1);
$('#today').onclick = () => { state.cursor = new Date(); render(); };
$('#view').addEventListener('click', (e) => {
  const el = e.target.closest('[data-act],[data-add]');
  if (!el) return;
  const card = el.closest('[data-id]');
  if (el.dataset.act === 'done') return toggleDone(card.dataset.id);
  if (el.dataset.act === 'edit') return openForm(state.tasks.find((t) => t.id === card.dataset.id));
  if (el.dataset.add && !e.target.closest('.chip')) openForm(null, el.dataset.add);
});
$('#enableNotif').onclick = async () => {
  if (!('Notification' in window)) return toast('Tu navegador no admite notificaciones');
  const p = await Notification.requestPermission();
  toast(p === 'granted' ? 'Notificaciones activadas' : 'Permiso denegado: verás los avisos dentro de la página');
};
$('#exportBtn').onclick = () => Store.exportJSON(state.tasks);
$('#importFile').onchange = async (e) => {
  try {
    state.tasks = await Store.importJSON(e.target.files[0]);
    persist();
    toast('Copia importada');
  } catch { toast('El archivo no es una copia válida de Agendau'); }
  e.target.value = '';
};

render();
checkReminders();
setInterval(checkReminders, 30000);
