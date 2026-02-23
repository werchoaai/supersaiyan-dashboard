/**
 * Overview Page — stats cards, phase flow, task table with filters
 */

function renderOverview() {
  const store = window._dashboardStore;
  if (!store || !store.tasks) return '<p class="text-gray-400 text-center py-20">No data loaded.</p>';

  const tasks = store.tasks;
  const total = tasks.length;
  const open = tasks.filter(t => t.status === 'OPEN').length;
  const closed = tasks.filter(t => t.status === 'CLOSED').length;
  const totalHandoffs = tasks.reduce((s, t) => s + ((t.stats && t.stats.totalHandoffs) || 0), 0);

  // Phase counts (open tasks only)
  const phaseCounts = {};
  tasks.filter(t => t.status === 'OPEN').forEach(t => {
    phaseCounts[t.phase] = (phaseCounts[t.phase] || 0) + 1;
  });

  // Apply filters and sort
  const filtered = sortTasks(
    filterTasks(tasks, store.filters),
    store.sortKey,
    store.sortDir
  );

  return `
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      ${statsCard('Total Tasks', total, 'bg-slate-50 border-slate-200', 'text-slate-700')}
      ${statsCard('Open', open, 'bg-green-50 border-green-200', 'text-green-700')}
      ${statsCard('Closed', closed, 'bg-gray-50 border-gray-200', 'text-gray-600')}
      ${statsCard('Total Handoffs', totalHandoffs, 'bg-indigo-50 border-indigo-200', 'text-indigo-700')}
    </div>

    <!-- Phase Flow -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Phase Flow</h2>
      <div class="flex items-center justify-center gap-2 flex-wrap text-sm">
        ${phaseFlowBlock('PLAN', phaseCounts['PLAN'] || 0)}
        <span class="text-gray-300 text-lg">&rarr;</span>
        ${phaseFlowBlock('HUMAN_APPROVE', phaseCounts['HUMAN_APPROVE'] || 0)}
        <span class="text-gray-300 text-lg">&rarr;</span>
        ${phaseFlowBlock('IMPLEMENT', phaseCounts['IMPLEMENT'] || 0)}
        <span class="text-gray-300 text-lg">&rarr;</span>
        ${phaseFlowBlock('HUMAN_FINAL', phaseCounts['HUMAN_FINAL'] || 0)}
        <span class="text-gray-300 text-lg">&rarr;</span>
        ${phaseFlowBlock('CLOSED', closed)}
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <select onchange="window._updateFilter('status', this.value)"
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="all" ${store.filters.status === 'all' ? 'selected' : ''}>All Status</option>
          <option value="OPEN" ${store.filters.status === 'OPEN' ? 'selected' : ''}>Open</option>
          <option value="CLOSED" ${store.filters.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
        </select>
        <select onchange="window._updateFilter('phase', this.value)"
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="all" ${store.filters.phase === 'all' ? 'selected' : ''}>All Phases</option>
          <option value="PLAN" ${store.filters.phase === 'PLAN' ? 'selected' : ''}>Plan</option>
          <option value="HUMAN_APPROVE" ${store.filters.phase === 'HUMAN_APPROVE' ? 'selected' : ''}>Approve</option>
          <option value="IMPLEMENT" ${store.filters.phase === 'IMPLEMENT' ? 'selected' : ''}>Implement</option>
          <option value="HUMAN_FINAL" ${store.filters.phase === 'HUMAN_FINAL' ? 'selected' : ''}>Final Review</option>
          <option value="CLOSED" ${store.filters.phase === 'CLOSED' ? 'selected' : ''}>Closed</option>
        </select>
        <select onchange="window._updateFilter('agent', this.value)"
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="all" ${store.filters.agent === 'all' ? 'selected' : ''}>All Agents</option>
          <option value="claude" ${store.filters.agent === 'claude' ? 'selected' : ''}>Claude</option>
          <option value="codex" ${store.filters.agent === 'codex' ? 'selected' : ''}>Codex</option>
          <option value="human" ${store.filters.agent === 'human' ? 'selected' : ''}>Human</option>
          <option value="none" ${store.filters.agent === 'none' ? 'selected' : ''}>None</option>
        </select>
        <div class="flex-1 min-w-[200px]">
          <input type="text" placeholder="Search tasks..."
                 value="${escapeAttr(store.filters.search || '')}"
                 oninput="window._updateFilter('search', this.value)"
                 class="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
      </div>
    </div>

    <!-- Task Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              ${sortHeader('Status', 'status')}
              ${sortHeader('Title', 'title')}
              ${sortHeader('Phase', 'phase')}
              ${sortHeader('Next Agent', 'nextAgent')}
              ${sortHeader('Created', 'created')}
              ${sortHeader('Duration', 'duration')}
              ${sortHeader('Handoffs', 'handoffs')}
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0
              ? '<tr><td colspan="7" class="py-8 text-center text-gray-400 text-sm">No tasks match your filters.</td></tr>'
              : filtered.map(taskRow).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function statsCard(label, value, bg, textColor) {
  return `
    <div class="rounded-xl border ${bg} p-4">
      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider">${label}</div>
      <div class="text-2xl font-bold ${textColor} mt-1">${value}</div>
    </div>`;
}

function phaseFlowBlock(phase, count) {
  return `
    <div class="flex flex-col items-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium phase-${phase}">
        ${phase.replace(/_/g, ' ')}
      </span>
      <span class="text-xs text-gray-400 mt-1">${count}</span>
    </div>`;
}

function sortHeader(label, key) {
  const store = window._dashboardStore;
  const arrow = store.sortKey === key ? (store.sortDir === 'asc' ? '&#9650;' : '&#9660;') : '&#8597;';
  return `
    <th class="py-2.5 px-4 sort-header" onclick="window._updateSort('${key}')">
      <span class="inline-flex items-center gap-1">${label} <span class="text-gray-300">${arrow}</span></span>
    </th>`;
}

function taskRow(task) {
  const phase = task.status === 'CLOSED' ? 'CLOSED' : (task.phase || '—');
  const duration = task.stats && task.stats.durationMinutes
    ? (task.stats.durationMinutes < 60
        ? task.stats.durationMinutes + 'm'
        : Math.floor(task.stats.durationMinutes / 60) + 'h ' + (task.stats.durationMinutes % 60) + 'm')
    : '—';
  const handoffs = task.stats ? (task.stats.totalHandoffs || 0) : 0;
  const created = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—';
  const agentColors = {
    claude: 'text-indigo-600', codex: 'text-emerald-600',
    human: 'text-amber-600', none: 'text-gray-400'
  };

  return `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        onclick="window.location.hash='#/task/${task.id}'">
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium status-${task.status}">${task.status}</span>
      </td>
      <td class="py-3 px-4">
        <div class="font-medium text-sm text-gray-900">${escapeHtml(task.title || task.id)}</div>
        <div class="text-xs text-gray-400 font-mono">${task.id}</div>
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium phase-${phase}">${phase.replace(/_/g, ' ')}</span>
      </td>
      <td class="py-3 px-4">
        <span class="text-sm font-medium ${agentColors[task.nextAgent] || 'text-gray-400'}">${task.nextAgent || '—'}</span>
      </td>
      <td class="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">${created}</td>
      <td class="py-3 px-4 text-sm text-gray-500">${duration}</td>
      <td class="py-3 px-4 text-sm text-gray-500">${handoffs}</td>
    </tr>`;
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
