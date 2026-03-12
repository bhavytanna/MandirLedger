const KEY = 'mandirledger_actor_v1';

export function setActor(actor) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(actor));
}

export function getActor() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.phone) return null;
    return { name: String(parsed.name), phone: String(parsed.phone) };
  } catch {
    return null;
  }
}

export function clearActor() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
