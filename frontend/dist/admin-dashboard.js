(() => {
  'use strict';
  const state = { token: sessionStorage.getItem('myz-admin-token') || '', view: 'overview', timer: null };
  const content = document.querySelector('#content');
  const status = document.querySelector('#refresh-status');

  async function api(path, options = {}) {
    const response = await fetch(`/api/admin/dashboard${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}`, ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload.data;
  }

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const badge = (value) => `<span class="badge ${escapeHtml(value)}">${escapeHtml(value)}</span>`;
  const table = (headers, rows) => rows.length
    ? `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`
    : '<div class="empty">No records found</div>';

  async function overview() {
    const data = await api('/overview');
    content.innerHTML = `<div class="stats">
      <div class="card"><div class="label">Users</div><div class="value">${data.users.total}</div></div>
      <div class="card"><div class="label">Active users</div><div class="value">${data.users.active}</div></div>
      <div class="card"><div class="label">Open orders</div><div class="value">${data.orders.open}</div></div>
      <div class="card"><div class="label">Pending payments</div><div class="value">${data.payments.pending}</div></div>
    </div><section class="panel"><div class="panel-head"><h2>Gateway status</h2></div>
      <div class="panel-body"><strong>Online</strong><p>Node ${escapeHtml(data.system.node)} · uptime ${data.system.uptimeSeconds}s</p></div></section>`;
  }

  async function users() {
    const data = await api('/users?limit=50');
    const rows = data.items.map((user) => `<tr><td>${escapeHtml(user.name || 'Unnamed')}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.role)}</td><td>${badge(user.status)}</td><td><button class="button secondary" data-user="${escapeHtml(user.id)}" data-status="${user.status === 'suspended' ? 'active' : 'suspended'}">${user.status === 'suspended' ? 'Activate' : 'Suspend'}</button></td></tr>`);
    content.innerHTML = `<section class="panel"><div class="panel-head"><h2>Users (${data.pagination.total})</h2></div>${table(['Name', 'Email', 'Role', 'Status', 'Action'], rows)}</section>`;
    content.querySelectorAll('[data-user]').forEach((button) => button.addEventListener('click', async () => {
      button.disabled = true;
      await api(`/users/${encodeURIComponent(button.dataset.user)}`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.status }) });
      await users();
    }));
  }

  async function payments() {
    const data = await api('/payments?limit=50');
    const rows = data.items.map((payment) => `<tr><td>${escapeHtml(payment.id)}</td><td>${payment.amount}</td><td>${escapeHtml(payment.currency)}</td><td>${badge(payment.status)}</td><td>${escapeHtml(payment.txHash || 'Awaiting chain reference')}</td></tr>`);
    content.innerHTML = `<section class="panel"><div class="panel-head"><h2>Payment monitoring (${data.pagination.total})</h2></div>${table(['ID', 'Amount', 'Currency', 'Status', 'Transaction'], rows)}</section>`;
  }

  async function reports() {
    const data = await api('/reports?days=30');
    const rows = data.payments.map((entry) => `<tr><td>${escapeHtml(entry._id.currency)}</td><td>${escapeHtml(entry._id.status)}</td><td>${entry.count}</td><td>${entry.amount}</td></tr>`);
    content.innerHTML = `<div class="toolbar"><button id="export" class="button secondary">Export JSON</button></div><section class="panel"><div class="panel-head"><h2>30-day payment report</h2></div>${table(['Currency', 'Status', 'Count', 'Amount'], rows)}</section>`;
    document.querySelector('#export').addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      link.download = `myzubster-report-${data.generatedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  const loaders = { overview, users, payments, reports };
  async function render() {
    content.innerHTML = '<div class="empty">Loading…</div>';
    try {
      await loaders[state.view]();
      status.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    } catch (error) {
      content.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
      status.textContent = 'Refresh failed';
      if (/credentials/i.test(error.message)) logout();
    }
  }

  function start() {
    document.querySelector('#login').classList.add('hidden');
    document.querySelector('#app').classList.remove('hidden');
    clearInterval(state.timer);
    state.timer = setInterval(render, 30000);
    render();
  }
  function logout() {
    sessionStorage.removeItem('myz-admin-token');
    clearInterval(state.timer);
    document.querySelector('#app').classList.add('hidden');
    document.querySelector('#login').classList.remove('hidden');
  }
  document.querySelector('#connect').addEventListener('click', () => {
    state.token = document.querySelector('#token').value.trim();
    if (!state.token) return;
    sessionStorage.setItem('myz-admin-token', state.token);
    start();
  });
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('active', item === button));
    state.view = button.dataset.view;
    document.querySelector('#title').textContent = button.textContent;
    render();
  }));
  if (state.token) start();
})();
