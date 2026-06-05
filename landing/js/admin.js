const API_BASE = window.INTIZOM_API_URL || 'http://localhost:3000/api';

let token = sessionStorage.getItem('adminToken') || '';
let allOrders = [];
let currentSection = 'dashboard';

const STATUS_LABELS = {
  pending: 'Yangi',
  confirmed: 'Qabul qilindi',
  shipped: 'Yetkazilmoqda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

const STATUS_CLASS = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

// Init
if (token) {
  showAdmin();
} else {
  document.getElementById('loginScreen').classList.remove('hidden');
}

// Login form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  const loginText = document.getElementById('loginText');
  const loginSpinner = document.getElementById('loginSpinner');

  loginError.classList.add('hidden');
  loginBtn.disabled = true;
  loginText.textContent = 'Kirish...';
  loginSpinner.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Foydalanuvchi nomi yoki parol noto\'g\'ri');
    const data = await res.json();
    token = data.accessToken || data.access_token || data.token;
    sessionStorage.setItem('adminToken', token);
    showAdmin();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  } finally {
    loginBtn.disabled = false;
    loginText.textContent = 'Kirish';
    loginSpinner.classList.add('hidden');
  }
});

function showAdmin() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  loadDashboard();
}

function doLogout() {
  token = '';
  sessionStorage.removeItem('adminToken');
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function showSection(name) {
  currentSection = name;
  document.getElementById('sectionDashboard').classList.toggle('hidden', name !== 'dashboard');
  document.getElementById('sectionOrders').classList.toggle('hidden', name !== 'orders');
  document.getElementById('navDashboard').classList.toggle('active', name === 'dashboard');
  document.getElementById('navOrders').classList.toggle('active', name === 'orders');
  document.getElementById('sectionTitle').textContent = name === 'dashboard' ? 'Dashboard' : 'Buyurtmalar';

  if (name === 'dashboard') loadDashboard();
  if (name === 'orders') loadOrders();
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  if (res.status === 401) { doLogout(); throw new Error('Sessiya tugadi'); }
  if (!res.ok) throw new Error('Server xatosi');
  return res.json();
}

async function loadDashboard() {
  try {
    const stats = await apiFetch('/admin/stats');
    document.getElementById('statToday').textContent = stats.today ?? '0';
    document.getElementById('statWeek').textContent = stats.week ?? '0';
    document.getElementById('statTotal').textContent = stats.total ?? '0';
    document.getElementById('statRevenue').textContent = (stats.totalRevenue ?? 0).toLocaleString('uz-UZ');

    const orders = await apiFetch('/admin/orders');
    allOrders = Array.isArray(orders) ? orders : (orders.data ?? []);
    renderRecentOrders(allOrders.slice(0, 8));
  } catch (err) {
    document.getElementById('recentOrdersContainer').innerHTML = `<div style="padding:2rem;text-align:center;color:#c0392b">${err.message}</div>`;
  }
}

async function loadOrders() {
  const status = document.getElementById('statusFilter')?.value || '';
  const url = status ? `/admin/orders?status=${status}` : '/admin/orders';
  try {
    const orders = await apiFetch(url);
    allOrders = Array.isArray(orders) ? orders : (orders.data ?? []);
    renderOrdersTable(allOrders, document.getElementById('ordersContainer'));
  } catch (err) {
    document.getElementById('ordersContainer').innerHTML = `<div style="padding:2rem;text-align:center;color:#c0392b">${err.message}</div>`;
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrdersContainer');
  if (!orders.length) {
    container.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--muted)">Buyurtma yo\'q</div>';
    return;
  }
  renderOrdersTable(orders, container);
}

function renderOrdersTable(orders, container) {
  if (!orders.length) {
    container.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--muted)">Buyurtma yo\'q</div>';
    return;
  }
  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="orders-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mijoz</th>
            <th>Telefon</th>
            <th>Manzil</th>
            <th>Miqdor</th>
            <th>To'lov</th>
            <th>Narx</th>
            <th>Status</th>
            <th>Sana</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => orderRow(o)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function orderRow(o) {
  const sana = new Date(o.createdAt).toLocaleDateString('uz-UZ', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
  return `
    <tr>
      <td style="font-weight:700;color:var(--accent)">${o.orderNumber}</td>
      <td>${escHtml(o.customerName)}</td>
      <td style="white-space:nowrap">${escHtml(o.customerPhone)}</td>
      <td>${escHtml(o.region)}, ${escHtml(o.address)}</td>
      <td style="text-align:center">${o.quantity}</td>
      <td>${escHtml(o.paymentMethod || '—')}</td>
      <td style="white-space:nowrap">${(o.totalPrice || 0).toLocaleString('uz-UZ')} so'm</td>
      <td><span class="status-badge ${STATUS_CLASS[o.status] || ''}">${STATUS_LABELS[o.status] || o.status}</span></td>
      <td style="white-space:nowrap;font-size:0.78rem">${sana}</td>
      <td class="order-actions">
        <select onchange="updateStatus(${o.id}, this.value)" title="Statusni o'zgartirish">
          ${Object.entries(STATUS_LABELS).map(([val, label]) => `<option value="${val}" ${o.status===val?'selected':''}>${label}</option>`).join('')}
        </select>
      </td>
    </tr>
  `;
}

async function updateStatus(id, status) {
  try {
    await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (currentSection === 'dashboard') loadDashboard();
    else loadOrders();
  } catch (err) {
    alert('Status o\'zgartirishda xatolik: ' + err.message);
  }
}

function exportCSV() {
  if (!allOrders.length) { alert('Eksport qilish uchun buyurtmalar yo\'q'); return; }
  const headers = ['#', 'Ism', 'Telefon', 'Shahar', 'Manzil', 'Miqdor', 'To\'lov', 'Narx', 'Status', 'Sana'];
  const rows = allOrders.map(o => [
    o.orderNumber,
    o.customerName,
    o.customerPhone,
    o.region,
    o.address,
    o.quantity,
    o.paymentMethod || '',
    o.totalPrice,
    STATUS_LABELS[o.status] || o.status,
    new Date(o.createdAt).toLocaleString('uz-UZ'),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intizom-buyurtmalar-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
