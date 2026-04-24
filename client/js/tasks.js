const API_TASKS = '/api/tasks';
const API_USERS = '/api/users';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !user) window.location.href = 'login.html';

let activeFilterUserId = null;
let activeFilterUserName = null;

document.getElementById('userName').textContent = user.name;
document.getElementById('userOrg').textContent = user.organization;
document.getElementById('userRole').textContent = user.role;

async function apiRequest(url, opts = {}) {
    const res = await fetch(url, {
        ...opts,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...opts.headers }
    });
    if (res.status === 401) { localStorage.clear(); window.location.href = 'login.html'; return null; }
    return res;
}

// ── Avatar colors ──
const COLORS = [
    'linear-gradient(135deg,#6c63ff,#5a52e0)', 'linear-gradient(135deg,#3dd9b6,#00b894)',
    'linear-gradient(135deg,#f06070,#e84343)', 'linear-gradient(135deg,#f0a050,#e67e22)',
    'linear-gradient(135deg,#a29bfe,#6c5ce7)', 'linear-gradient(135deg,#fd79a8,#e84393)',
    'linear-gradient(135deg,#00cec9,#0984e3)', 'linear-gradient(135deg,#55efc4,#00b894)'
];
function avatarColor(name) {
    let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// ── Team Members (Admin) ──
async function loadTeamMembers() {
    if (user.role !== 'admin') return;
    try {
        const res = await apiRequest(API_USERS);
        if (!res) return;
        const members = await res.json();
        if (!res.ok) return;

        document.getElementById('teamSection').style.display = 'block';

        let html = `<div class="tm on" id="tm-all" onclick="clearFilter()"><div class="tm-av all">👥</div><span class="tm-name">All</span></div>`;
        const sel = document.getElementById('taskAssignTo');
        sel.style.display = 'inline-block';
        sel.innerHTML = '<option value="">Assign to...</option>';

        members.forEach(m => {
            html += `<div class="tm" id="tm-${m._id}" onclick="filterByUser('${m._id}','${esc(m.name)}')">
                <div class="tm-av" style="background:${avatarColor(m.name)}">${initials(m.name)}</div>
                <span class="tm-name">${esc(m.name)}${m._id === user.id ? ' (You)' : ''}</span>
                <span class="tm-role ${m.role}">${m.role}</span>
            </div>`;
            sel.innerHTML += `<option value="${m._id}">${m.name}</option>`;
        });

        document.getElementById('teamList').innerHTML = html;
    } catch (e) { console.error('Team load error:', e); }
}

// ── Filter ──
function filterByUser(id, name) {
    activeFilterUserId = id; activeFilterUserName = name;
    document.querySelectorAll('.tm').forEach(el => el.classList.remove('on'));
    const el = document.getElementById(`tm-${id}`);
    if (el) el.classList.add('on');
    document.getElementById('filterText').textContent = `Showing: ${name}`;
    document.getElementById('filterBanner').style.display = 'flex';
    document.getElementById('taskListHeading').textContent = `${name}'s Tasks`;
    loadTasks();
}

function clearFilter() {
    activeFilterUserId = null; activeFilterUserName = null;
    document.querySelectorAll('.tm').forEach(el => el.classList.remove('on'));
    const a = document.getElementById('tm-all'); if (a) a.classList.add('on');
    document.getElementById('filterBanner').style.display = 'none';
    document.getElementById('taskListHeading').textContent = user.role === 'admin' ? 'All Organization Tasks' : 'Your Tasks';
    loadTasks();
}

// ── Load Tasks ──
async function loadTasks() {
    const list = document.getElementById('taskList');
    const load = document.getElementById('loadingState');
    try {
        let url = API_TASKS;
        if (activeFilterUserId) url += `?userId=${activeFilterUserId}`;
        const res = await apiRequest(url);
        if (!res) return;
        const tasks = await res.json();
        updateStats(tasks);
        if (load) load.style.display = 'none';

        if (!tasks.length) {
            list.innerHTML = `<div class="empty"><div class="ico">📝</div><p>${activeFilterUserId ? 'No tasks for this user.' : 'No tasks yet — create one above!'}</p></div>`;
            return;
        }
        list.innerHTML = tasks.map(taskCard).join('');
    } catch (e) {
        console.error(e);
        if (load) load.style.display = 'none';
        list.innerHTML = '<div class="empty"><div class="ico">⚠️</div><p>Failed to load tasks.</p></div>';
    }
}

function taskCard(t) {
    const done = t.status === 'completed';
    const by = t.createdBy?.name || 'Unknown';
    const byId = t.createdBy?._id || '';
    const to = t.assignedTo?.name || null;
    const toId = t.assignedTo?._id || '';
    const display = to || by;
    const d = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const canManage = user.role === 'admin' || byId === user.id || toId === user.id;

    return `<div class="task${done ? ' done' : ''}" id="task-${t._id}">
        <div class="t-av${user.role === 'admin' && toId ? ' click' : ''}" style="background:${avatarColor(display)}" title="${esc(display)}"
            ${user.role === 'admin' && toId ? `onclick="filterByUser('${toId}','${esc(to)}')"` : ''}>${initials(display)}</div>
        <div class="t-body">
            <div class="t-title">${esc(t.title)}</div>
            ${t.description ? `<div class="t-desc">${esc(t.description)}</div>` : ''}
            <div class="t-tags">
                <span class="tag ${done ? 'tag-done' : 'tag-pending'}">${done ? '✓ Done' : '● Pending'}</span>
                ${to ? `<span class="tag tag-assign">📌 ${esc(to)}</span>` : ''}
                <span class="tag tag-user">👤 ${esc(by)}</span>
                <span style="color:var(--text-muted)">📅 ${d}</span>
            </div>
        </div>
        ${canManage ? `<div class="t-actions">
            <button class="btn btn-sm btn-edit" onclick="openEditModal('${t._id}','${esc(t.title).replace(/'/g, "\\'").replace(/"/g, '&quot;')}','${esc(t.description || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}','${toId}')">✏️</button>
            <button class="btn btn-sm btn-green" onclick="toggleTask('${t._id}')">${done ? '↩ Undo' : '✓ Done'}</button>
            <button class="btn btn-sm btn-red" onclick="deleteTask('${t._id}')">🗑</button>
        </div>` : ''}
    </div>`;
}

function updateStats(tasks) {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('pendingTasks').textContent = tasks.filter(t => t.status === 'pending').length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.status === 'completed').length;
}

// ── Create ──
async function handleCreateTask(e) {
    e.preventDefault();
    const ti = document.getElementById('taskTitle');
    const de = document.getElementById('taskDesc');
    const as = document.getElementById('taskAssignTo');
    if (!ti.value.trim()) return;

    try {
        const res = await apiRequest(API_TASKS, {
            method: 'POST',
            body: JSON.stringify({ title: ti.value.trim(), description: de.value.trim(), assignedTo: as.value || null })
        });
        if (!res) return;
        const data = await res.json();
        if (!res.ok) { alert(data.message); return; }
        ti.value = ''; de.value = ''; as.value = '';
        activeFilterUserId && activeFilterUserId !== user.id ? clearFilter() : loadTasks();
    } catch (e) { console.error(e); alert('Failed to create task.'); }
}

// ── Toggle / Delete ──
async function toggleTask(id) {
    try { const r = await apiRequest(`${API_TASKS}/${id}/toggle`, { method: 'PUT' }); if (r?.ok) loadTasks(); }
    catch (e) { console.error(e); }
}
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        const r = await apiRequest(`${API_TASKS}/${id}`, { method: 'DELETE' });
        if (!r) return;
        if (r.ok) {
            const c = document.getElementById(`task-${id}`);
            if (c) { c.style.opacity = '0'; c.style.transform = 'translateX(16px)'; c.style.transition = 'all .25s'; setTimeout(() => loadTasks(), 250); }
            else loadTasks();
        }
    } catch (e) { console.error(e); }
}

// ── Edit Task ──
function openEditModal(id, title, desc, assignedToId) {
    document.getElementById('editTaskId').value = id;
    document.getElementById('editTaskTitle').value = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    document.getElementById('editTaskDesc').value = desc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    // Populate assignee dropdown with same options as create form
    const editAssign = document.getElementById('editTaskAssignTo');
    const createAssign = document.getElementById('taskAssignTo');
    if (user.role === 'admin' && createAssign.style.display !== 'none') {
        editAssign.style.display = 'block';
        editAssign.innerHTML = createAssign.innerHTML;
        editAssign.value = assignedToId || '';
    } else {
        editAssign.style.display = 'none';
    }

    document.getElementById('editModal').classList.add('show');
    document.getElementById('editTaskTitle').focus();
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

async function handleEditTask(e) {
    e.preventDefault();
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDesc').value.trim();
    const assignedTo = document.getElementById('editTaskAssignTo').value || null;

    if (!title) return;

    try {
        const body = { title, description };
        if (user.role === 'admin') body.assignedTo = assignedTo;

        const res = await apiRequest(`${API_TASKS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        if (!res) return;
        const data = await res.json();
        if (!res.ok) { alert(data.message); return; }
        closeEditModal();
        loadTasks();
    } catch (e) { console.error(e); alert('Failed to update task.'); }
}

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
    if (e.target.id === 'editModal') closeEditModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEditModal();
});

function handleLogout() { localStorage.clear(); window.location.href = 'login.html'; }

// ── Init ──
document.getElementById('taskListHeading').textContent = user.role === 'admin' ? 'All Organization Tasks' : 'Your Tasks';
loadTeamMembers();
loadTasks();
