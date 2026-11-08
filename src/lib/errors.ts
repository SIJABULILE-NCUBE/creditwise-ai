import { MESSAGES } from './messages';

const KNOWN_MESSAGES = new Set<string>(Object.values(MESSAGES));

/** The one place that turns an API failure into a PRD 12.2 message. Raw errors never reach the screen. */
export function mapApiError(status: number, message: string | undefined): string {
  if (status === 401) return MESSAGES.loggedOut;
  if (status === 403) return MESSAGES.notAllowed;
  return message && KNOWN_MESSAGES.has(message) ? message : MESSAGES.serverError;
}

/** The same for direct database calls. `fallback` is the screen's own failure message. */
export function mapDbError(error: { code?: string; message?: string }, fallback: string): string {
  return error.code === '42501' ? MESSAGES.notAllowed : fallback;
}
