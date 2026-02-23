/**
 * Chat Feed — renders NATURAL_CHAT.md as styled chat bubbles
 */

function renderChatFeed(chatMessages) {
  if (!chatMessages || chatMessages.length === 0) {
    return '<p class="text-gray-400 text-sm text-center py-8">No chat messages yet.</p>';
  }

  const bubbles = chatMessages.map(msg => {
    const agent = msg.from || 'system';
    const bubbleClass = `chat-bubble chat-bubble-${agent}`;
    const alignClass = agent === 'codex' ? 'flex justify-end' : (agent === 'system' ? 'flex justify-center' : 'flex justify-start');

    const agentLabel = agentBadge(agent);
    const timestamp = formatTime(msg.timestamp);
    const target = msg.to && msg.to !== 'all' ? ` &rarr; ${agentBadge(msg.to)}` : '';

    if (agent === 'system') {
      return `
        <div class="${alignClass} mb-2">
          <div class="${bubbleClass}">
            <div class="text-xs text-slate-400 mb-1">${timestamp}</div>
            ${escapeHtml(msg.message)}
          </div>
        </div>
      `;
    }

    return `
      <div class="${alignClass} mb-3">
        <div class="${bubbleClass}">
          <div class="flex items-center gap-2 mb-1">
            ${agentLabel}${target}
            <span class="text-xs text-gray-400 ml-auto">${timestamp}</span>
          </div>
          <div class="text-sm">${escapeHtml(msg.message)}</div>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="space-y-1 py-4">${bubbles}</div>`;
}

function agentBadge(agent) {
  const colors = {
    claude: 'bg-indigo-100 text-indigo-700',
    codex:  'bg-emerald-100 text-emerald-700',
    human:  'bg-amber-100 text-amber-700',
    system: 'bg-slate-100 text-slate-500',
    all:    'bg-gray-100 text-gray-500',
  };
  const names = {
    claude: 'Claude',
    codex: 'Codex',
    human: 'Malcolm',
    system: 'System',
    all: 'All',
  };
  const c = colors[agent] || colors.system;
  const n = names[agent] || agent;
  return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${c}">${n}</span>`;
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return ts; }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
