export function formatOrderTimestamp(value) {
  if (!value || value === 'Just now' || value === 'Today') return 'Time not recorded';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function normalizeOrderStatus(status) {
  const trimmedStatus = (status || 'PENDING').trim();
  const legacyStatus = trimmedStatus.match(/^\{\s*status\s*:\s*"?([a-z_]+)"?\s*\}$/i);
  return (legacyStatus?.[1] || trimmedStatus).toUpperCase();
}

export function sortAdminOrders(orders) {
  return [...orders].sort((first, second) => {
    const firstCompleted = normalizeOrderStatus(first.status) === 'COMPLETED';
    const secondCompleted = normalizeOrderStatus(second.status) === 'COMPLETED';
    if (firstCompleted !== secondCompleted) return firstCompleted ? 1 : -1;

    const firstTime = new Date(first.placedAt || first.timestamp || first.date).getTime();
    const secondTime = new Date(second.placedAt || second.timestamp || second.date).getTime();
    const firstHasTime = Number.isFinite(firstTime);
    const secondHasTime = Number.isFinite(secondTime);
    if (firstHasTime !== secondHasTime) return firstHasTime ? -1 : 1;
    if (firstHasTime && firstTime !== secondTime) return secondTime - firstTime;

    const idDifference = Number(second.id) - Number(first.id);
    return Number.isFinite(idDifference) && idDifference !== 0
      ? idDifference
      : String(second.id).localeCompare(String(first.id));
  });
}