const count = document.getElementById('petition-count');
const goal = document.getElementById('petition-goal');
const progress = document.getElementById('petition-progress');
const status = document.getElementById('petition-live-status');
let busy = false, lastChecked = null;
async function refresh() {
  if (busy || document.hidden) return;
  busy = true;
  try {
    const response = await fetch('/api/petition', {signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw Error('Unavailable');
    const data = await response.json();
    if (!Number.isSafeInteger(data.count) || data.count < 0 || !Number.isSafeInteger(data.goal) || data.goal <= 0 || !Number.isFinite(Date.parse(data.checkedAt))) throw Error('Invalid count');
    count.textContent = data.count.toLocaleString();
    goal.textContent = `Next goal: ${data.goal.toLocaleString()} signatures`;
    progress.max = data.goal;
    progress.value = Math.min(data.count, data.goal);
    progress.hidden = false;
    lastChecked = new Date(data.checkedAt).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
    status.textContent = `Updated ${lastChecked} · Refreshes every minute`;
  } catch {
    status.textContent = lastChecked
      ? `Last updated ${lastChecked} · Update unavailable; retrying automatically`
      : 'Count temporarily unavailable. View the current count on Change.org.';
  } finally { busy = false; }
}
refresh();
setInterval(refresh, 60000);
document.addEventListener('visibilitychange', refresh);
