import { describe, it, expect } from 'vitest';
import { getExpiryReason, INACTIVITY_LIMIT_MS, ABSOLUTE_LIMIT_MS } from '@/lib/session';

const T0 = 1_800_000_000_000;

describe('T-AUTH-4 automatic log-out limits', () => {
  it('T-AUTH-4 limits are 30 minutes and 7 days', () => {
    expect(INACTIVITY_LIMIT_MS).toBe(30 * 60 * 1000);
    expect(ABSOLUTE_LIMIT_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('T-AUTH-4 30 minutes with no input expires the session', () => {
    expect(getExpiryReason({ now: T0 + INACTIVITY_LIMIT_MS - 1, loginAt: T0, lastActivityAt: T0 })).toBeNull();
    expect(getExpiryReason({ now: T0 + INACTIVITY_LIMIT_MS, loginAt: T0, lastActivityAt: T0 })).toBe('inactive');
  });

  it('T-AUTH-4 activity resets the 30-minute timer', () => {
    const activity = T0 + INACTIVITY_LIMIT_MS - 1000;
    expect(getExpiryReason({ now: T0 + INACTIVITY_LIMIT_MS + 1000, loginAt: T0, lastActivityAt: activity })).toBeNull();
  });

  it('T-AUTH-4 7 days after log-in always expires, even when active', () => {
    const now = T0 + ABSOLUTE_LIMIT_MS;
    expect(getExpiryReason({ now, loginAt: T0, lastActivityAt: now })).toBe('absolute');
  });
});
