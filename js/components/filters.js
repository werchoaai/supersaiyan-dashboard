/**
 * Filters — filter/sort logic for task table
 */

function filterTasks(tasks, filters) {
  let result = [...tasks];

  if (filters.status && filters.status !== 'all') {
    result = result.filter(t => t.status === filters.status);
  }
  if (filters.phase && filters.phase !== 'all') {
    result = result.filter(t => (t.status === 'CLOSED' ? 'CLOSED' : t.phase) === filters.phase);
  }
  if (filters.agent && filters.agent !== 'all') {
    result = result.filter(t => t.nextAgent === filters.agent);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.id && t.id.toLowerCase().includes(q))
    );
  }

  return result;
}

function sortTasks(tasks, sortKey, sortDir) {
  const dir = sortDir === 'asc' ? 1 : -1;

  return [...tasks].sort((a, b) => {
    let va, vb;
    switch (sortKey) {
      case 'title':
        va = (a.title || '').toLowerCase();
        vb = (b.title || '').toLowerCase();
        return va < vb ? -dir : va > vb ? dir : 0;
      case 'status':
        va = a.status || '';
        vb = b.status || '';
        return va < vb ? -dir : va > vb ? dir : 0;
      case 'phase':
        va = a.status === 'CLOSED' ? 'CLOSED' : (a.phase || '');
        vb = b.status === 'CLOSED' ? 'CLOSED' : (b.phase || '');
        return va < vb ? -dir : va > vb ? dir : 0;
      case 'nextAgent':
        va = a.nextAgent || '';
        vb = b.nextAgent || '';
        return va < vb ? -dir : va > vb ? dir : 0;
      case 'created':
        va = a.createdAt || '';
        vb = b.createdAt || '';
        return va < vb ? -dir : va > vb ? dir : 0;
      case 'duration':
        va = (a.stats && a.stats.durationMinutes) || 0;
        vb = (b.stats && b.stats.durationMinutes) || 0;
        return (va - vb) * dir;
      case 'handoffs':
        va = (a.stats && a.stats.totalHandoffs) || 0;
        vb = (b.stats && b.stats.totalHandoffs) || 0;
        return (va - vb) * dir;
      default:
        return 0;
    }
  });
}
