/**
 * App — store, router, data loading, auth, render loop
 * No framework — pure vanilla JS
 */

// ===== Auth =====
const PASS_HASH = 'fe9da700d853d243d31b18fd2ea39d83eb4495ed6dfea73663391f255347281e';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

window.handleLogin = async function(e) {
  e.preventDefault();
  const input = document.getElementById('password-input').value;
  const hash = await sha256(input);
  if (hash === PASS_HASH) {
    sessionStorage.setItem('ss_auth', '1');
    showDashboard();
    return false;
  }
  document.getElementById('auth-error').classList.remove('hidden');
  document.getElementById('password-input').value = '';
  return false;
};

function showDashboard() {
  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadData();
}

// Check auth on load
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('ss_auth') === '1') {
    showDashboard();
  }
});

// ===== Store =====
const store = {
  loading: true,
  error: null,
  publishedAt: null,
  tasks: [],
  currentPage: 'overview',
  currentTaskId: null,
  activeTab: 'chat',
  filters: { status: 'all', phase: 'all', agent: 'all', search: '' },
  sortKey: 'created',
  sortDir: 'desc',
};

// Expose globally for render functions
window._dashboardStore = store;

// ===== Render =====
function render() {
  const el = document.getElementById('content');
  if (!el) return;

  if (store.loading) {
    el.innerHTML = `
      <div class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-500">Loading tasks...</span>
      </div>`;
    return;
  }

  if (store.error) {
    el.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-600 font-medium">${escapeHtml(store.error)}</p>
        <button onclick="loadData()" class="mt-3 text-sm text-red-500 hover:text-red-700 underline">Retry</button>
      </div>`;
    return;
  }

  if (store.currentPage === 'detail') {
    el.innerHTML = renderDetail();
  } else {
    el.innerHTML = renderOverview();
  }

  // Update nav timestamp
  const ts = document.getElementById('updated-at');
  if (ts && store.publishedAt) {
    ts.textContent = 'Updated ' + timeAgo(store.publishedAt);
  }

  // Highlight code blocks after render
  setTimeout(() => {
    document.querySelectorAll('.md-content pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }, 50);
}

// ===== Router =====
function handleRoute() {
  const hash = window.location.hash || '#/';
  const taskMatch = hash.match(/^#\/task\/(.+)$/);
  if (taskMatch) {
    store.currentPage = 'detail';
    store.currentTaskId = decodeURIComponent(taskMatch[1]);
    store.activeTab = 'chat';
  } else {
    store.currentPage = 'overview';
    store.currentTaskId = null;
  }
  render();
}

window.addEventListener('hashchange', handleRoute);

// ===== Data Loading =====
async function loadData() {
  store.loading = true;
  store.error = null;
  render();

  try {
    const resp = await fetch('/data/tasks.json?t=' + Date.now());
    if (!resp.ok) throw new Error('Failed to load task data (HTTP ' + resp.status + ')');
    const data = await resp.json();
    store.publishedAt = data.publishedAt;
    store.tasks = data.tasks || [];
    store.loading = false;
  } catch (err) {
    store.loading = false;
    store.error = err.message || 'Failed to load data';
  }
  handleRoute();
}

// ===== Global Event Handlers =====
window._updateFilter = function(key, value) {
  store.filters[key] = value;
  render();
};

window._updateSort = function(key) {
  if (store.sortKey === key) {
    store.sortDir = store.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    store.sortKey = key;
    store.sortDir = 'asc';
  }
  render();
};

window._setTab = function(tab) {
  store.activeTab = tab;
  render();
};

// ===== Helpers =====
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ===== Configure Libraries =====
if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true, gfm: true });
}
