const EVENT = 'creditwise:flags-changed';

/** Tells the tab bar to refresh its open-flag badge. */
export function notifyFlagsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

export function onFlagsChanged(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
