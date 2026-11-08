/** Date-times are saved in UTC and shown in SAST (PRD 10.1). */
const TIME_ZONE = 'Africa/Johannesburg';

function parts(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const map = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return map as Record<'day' | 'month' | 'year' | 'hour' | 'minute', string>;
}

/** "27 Oct 2026, 14:05" */
export function formatDateTime(value: string | Date): string {
  const p = parts(value);
  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute}`;
}

/** "27 Oct 2026" for a stored date-time. */
export function formatDate(value: string | Date): string {
  const p = parts(value);
  return `${p.day} ${p.month} ${p.year}`;
}

/** "14:05" */
export function formatTime(value: string | Date): string {
  const p = parts(value);
  return `${p.hour}:${p.minute}`;
}

/** "21 Oct 2026" for a plain YYYY-MM-DD date, which has no time zone to convert. */
export function formatPlainDate(date: string): string {
  return formatDate(new Date(`${date}T12:00:00+02:00`));
}

/** Today's date in SAST as YYYY-MM-DD. */
export function todaySast(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}
