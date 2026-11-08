/** 30-minute inactivity and 7-day sign-out, enforced in the browser (plan Section 11, Section 18 #3). */
export const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
export const ABSOLUTE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;
export const LOGIN_AT_KEY = 'creditwise.loginAt';
export const LAST_ACTIVITY_KEY = 'creditwise.lastActivityAt';

const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'input'] as const;

export type ExpiryReason = 'inactive' | 'absolute';

export function getExpiryReason(times: { now: number; loginAt: number; lastActivityAt: number }): ExpiryReason | null {
  if (times.now - times.loginAt >= ABSOLUTE_LIMIT_MS) return 'absolute';
  if (times.now - times.lastActivityAt >= INACTIVITY_LIMIT_MS) return 'inactive';
  return null;
}

/** Called before a new log-in, and after every log-out, so that old times can't expire a new session. */
export function clearSessionTimes() {
  localStorage.removeItem(LOGIN_AT_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

function readTime(key: string, fallback: number): number {
  const stored = Number(localStorage.getItem(key));
  if (stored > 0) return stored;
  localStorage.setItem(key, String(fallback));
  return fallback;
}

/** Watches for activity and calls onExpired once a limit is reached. Returns a stop function. */
export function startSessionWatch(onExpired: () => void): () => void {
  let stopped = false;

  const check = () => {
    if (stopped) return;
    const now = Date.now();
    const reason = getExpiryReason({ now, loginAt: readTime(LOGIN_AT_KEY, now), lastActivityAt: readTime(LAST_ACTIVITY_KEY, now) });
    if (reason) {
      stop();
      onExpired();
    }
  };
  const onActivity = () => localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  const interval = setInterval(check, CHECK_INTERVAL_MS);

  function stop() {
    stopped = true;
    clearInterval(interval);
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity, true));
  }

  ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, true));
  check();
  return stop;
}

const EXPIRED_EVENT = 'creditwise:session-expired';

/** The server refused the login token (401), so the session is over whatever the local timers say. */
export function notifySessionExpired() {
  window.dispatchEvent(new Event(EXPIRED_EVENT));
}

export function onSessionExpired(listener: () => void): () => void {
  window.addEventListener(EXPIRED_EVENT, listener);
  return () => window.removeEventListener(EXPIRED_EVENT, listener);
}
