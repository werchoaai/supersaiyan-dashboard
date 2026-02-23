/**
 * Timeline — renders handoff log as a structured table
 */

function renderHandoffTimeline(handoffs) {
  if (!handoffs || handoffs.length === 0) {
    return '<p class="text-gray-400 text-sm text-center py-8">No handoffs recorded.</p>';
  }

  const rows = handoffs.map((h, i) => {
    const fromBadge = agentBadge(h.from);
    const toBadge = agentBadge(h.to);
    const phasePill = h.phase ? renderPhasePill(h.phase) : '<span class="text-gray-400 text-xs">—</span>';
    const ts = formatTime(h.timestamp);

    return `
      <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td class="py-2.5 px-3 text-xs text-gray-400 font-mono">${i + 1}</td>
        <td class="py-2.5 px-3 text-xs text-gray-500 whitespace-nowrap">${ts}</td>
        <td class="py-2.5 px-3">${fromBadge}</td>
        <td class="py-2.5 px-3 text-gray-300">&rarr;</td>
        <td class="py-2.5 px-3">${toBadge}</td>
        <td class="py-2.5 px-3">${phasePill}</td>
        <td class="py-2.5 px-3 text-sm text-gray-700">${escapeHtml(h.summary)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
            <th class="py-2 px-3">#</th>
            <th class="py-2 px-3">Time</th>
            <th class="py-2 px-3">From</th>
            <th class="py-2 px-3"></th>
            <th class="py-2 px-3">To</th>
            <th class="py-2 px-3">Phase</th>
            <th class="py-2 px-3">Summary</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderPhasePill(phase) {
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium phase-${phase}">${phase.replace('_', ' ')}</span>`;
}
