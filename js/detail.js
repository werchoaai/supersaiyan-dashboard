/**
 * Detail Page — task detail with tabs, phase stepper, chat, markdown content
 */

function renderDetail() {
  const store = window._dashboardStore;
  if (!store) return '';

  const task = store.tasks.find(t => t.id === store.currentTaskId);
  if (!task) {
    return `
      <div class="text-center py-20">
        <p class="text-gray-400 text-lg">Task not found</p>
        <a href="#/" class="text-indigo-600 text-sm hover:underline mt-2 inline-block">&larr; Back to overview</a>
      </div>`;
  }

  const activeTab = store.activeTab || 'chat';
  const duration = task.stats && task.stats.durationMinutes
    ? (task.stats.durationMinutes < 60
        ? task.stats.durationMinutes + ' min'
        : Math.floor(task.stats.durationMinutes / 60) + 'h ' + (task.stats.durationMinutes % 60) + 'm')
    : '—';

  const turns = task.stats && task.stats.agentTurns ? task.stats.agentTurns : {};
  const totalTurns = (turns.claude || 0) + (turns.codex || 0) + (turns.human || 0);

  return `
    <!-- Back link -->
    <a href="#/" class="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      All Tasks
    </a>

    <!-- Header Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">${escapeHtml(task.title || task.id)}</h1>
          <p class="text-xs font-mono text-gray-400 mt-1">${task.id}</p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-${task.status}">${task.status}</span>
      </div>

      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-5">
        <span>Requester: <strong class="text-gray-700">${escapeHtml(task.requester || '—')}</strong></span>
        <span>Created: <strong class="text-gray-700">${task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}</strong></span>
        ${task.closedAt ? `<span>Closed: <strong class="text-gray-700">${new Date(task.closedAt).toLocaleString()}</strong></span>` : ''}
        <span>Duration: <strong class="text-gray-700">${duration}</strong></span>
      </div>

      <!-- Phase Stepper -->
      <div class="mb-4">
        ${renderPhaseStepper(task.phase || 'PLAN', task.status)}
      </div>

      <!-- Agent Activity Bar -->
      ${totalTurns > 0 ? `
      <div class="mt-4">
        <div class="text-xs text-gray-500 mb-1.5">Agent Turns</div>
        <div class="flex rounded-full overflow-hidden h-3 bg-gray-100">
          ${turns.claude ? `<div class="bg-indigo-500" style="width:${(turns.claude/totalTurns)*100}%" title="Claude: ${turns.claude}"></div>` : ''}
          ${turns.codex ? `<div class="bg-emerald-500" style="width:${(turns.codex/totalTurns)*100}%" title="Codex: ${turns.codex}"></div>` : ''}
          ${turns.human ? `<div class="bg-amber-400" style="width:${(turns.human/totalTurns)*100}%" title="Human: ${turns.human}"></div>` : ''}
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Claude ${turns.claude || 0}</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Codex ${turns.codex || 0}</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Human ${turns.human || 0}</span>
        </div>
      </div>` : ''}

      <!-- Plan Round Info -->
      ${task.planRound ? `
      <div class="mt-3 flex gap-4 text-xs text-gray-500">
        <span>Plan Rounds — Claude: ${task.planRound.claude || 0}, Codex: ${task.planRound.codex || 0}</span>
        ${task.planAgreed ? `<span>Agreed — Claude: ${task.planAgreed.claude ? 'Yes' : 'No'}, Codex: ${task.planAgreed.codex ? 'Yes' : 'No'}</span>` : ''}
      </div>` : ''}
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="flex border-b border-gray-200 overflow-x-auto">
        ${tabBtn('chat', 'Chat', activeTab)}
        ${tabBtn('task', 'Task', activeTab)}
        ${tabBtn('plan', 'Plan', activeTab)}
        ${tabBtn('review', 'Review', activeTab)}
        ${tabBtn('impl', 'Implementation', activeTab)}
        ${tabBtn('decision', 'Decision', activeTab)}
        ${tabBtn('handoffs', 'Handoff Log', activeTab)}
      </div>
      <div class="p-5">
        ${renderTabContent(task, activeTab)}
      </div>
    </div>
  `;
}

function tabBtn(id, label, activeTab) {
  const active = activeTab === id;
  return `<button class="tab-btn ${active ? 'active' : ''}" onclick="window._setTab('${id}')">${label}</button>`;
}

function renderTabContent(task, tab) {
  switch (tab) {
    case 'chat':     return renderChatFeed(task.chat);
    case 'task':     return renderMarkdown(task.taskMd);
    case 'plan':     return renderMarkdown(task.planDiscussionMd);
    case 'review':   return renderReviewMd(task.claudeReviewMd);
    case 'impl':     return renderMarkdown(task.codexImplMd);
    case 'decision': return renderMarkdown(task.decisionMd);
    case 'handoffs': return renderHandoffTimeline(task.handoffs);
    default:         return '';
  }
}

function renderMarkdown(md) {
  if (!md || md.trim() === '') {
    return '<p class="text-gray-400 text-sm text-center py-8">No content yet.</p>';
  }
  try {
    const html = marked.parse(md);
    return `<div class="md-content">${html}</div>`;
  } catch {
    return `<pre class="text-sm text-gray-600 whitespace-pre-wrap">${escapeHtml(md)}</pre>`;
  }
}

function renderReviewMd(md) {
  if (!md || md.trim() === '') {
    return '<p class="text-gray-400 text-sm text-center py-8">No review yet.</p>';
  }
  let html = renderMarkdown(md);
  html = html.replace(/\[BLOCKER\]/g, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold severity-BLOCKER">BLOCKER</span>');
  html = html.replace(/\[MEDIUM\]/g, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold severity-MEDIUM">MEDIUM</span>');
  html = html.replace(/\[LOW\]/g, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold severity-LOW">LOW</span>');
  return html;
}
