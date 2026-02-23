/**
 * App — Alpine.js store, router, data loading
 */

// Global store reference for non-Alpine contexts
window._dashboardStore = {
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

// Global helpers for onclick handlers (Alpine x-html doesn't bind events)
window._updateFilter = function(key, value) {
  window._dashboardStore.filters[key] = value;
  // Trigger Alpine reactivity
  const comp = document.querySelector('[x-data="dashboard"]');
  if (comp && comp.__x) comp.__x.$data.store.filters[key] = value;
  rerender();
};

window._updateSort = function(key) {
  const store = window._dashboardStore;
  if (store.sortKey === key) {
    store.sortDir = store.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    store.sortKey = key;
    store.sortDir = 'asc';
  }
  rerender();
};

window._setTab = function(tab) {
  window._dashboardStore.activeTab = tab;
  rerender();
};

function rerender() {
  // Force Alpine to re-evaluate
  const el = document.querySelector('[x-data="dashboard"]');
  if (el && el._x_dataStack) {
    const data = el._x_dataStack[0];
    // Trigger reactivity by toggling a value
    data.store = Object.assign({}, window._dashboardStore);
  }
}

// Router
function handleRoute() {
  const hash = window.location.hash || '#/';
  const store = window._dashboardStore;

  const taskMatch = hash.match(/^#\/task\/(.+)$/);
  if (taskMatch) {
    store.currentPage = 'detail';
    store.currentTaskId = decodeURIComponent(taskMatch[1]);
    store.activeTab = 'chat';
  } else {
    store.currentPage = 'overview';
    store.currentTaskId = null;
  }
  rerender();
}

window.addEventListener('hashchange', handleRoute);

// Data loading
async function loadTaskData() {
  const store = window._dashboardStore;
  store.loading = true;
  store.error = null;
  rerender();

  try {
    const resp = await fetch('/data/tasks.json?t=' + Date.now());
    if (!resp.ok) throw new Error('Failed to load task data');
    const data = await resp.json();
    store.publishedAt = data.publishedAt;
    store.tasks = data.tasks || [];
    store.loading = false;
    store.error = null;
  } catch (err) {
    store.loading = false;
    store.error = err.message || 'Failed to load data';
  }
  rerender();
}

// Time ago helper
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

// Alpine component
document.addEventListener('alpine:init', () => {
  Alpine.data('dashboard', () => ({
    store: window._dashboardStore,

    init() {
      this.loadData();
      handleRoute();
    },

    async loadData() {
      await loadTaskData();
      this.store = Object.assign({}, window._dashboardStore);
    },

    timeAgo(d) { return timeAgo(d); },

    renderOverview() {
      return renderOverview();
    },

    renderDetail() {
      return renderDetail();
    },
  }));
});

// Configure marked
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}

// Configure mermaid
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
}
