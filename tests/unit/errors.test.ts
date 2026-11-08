import { describe, it, expect } from 'vitest';
import { mapApiError, mapDbError } from '@/lib/errors';
import { MESSAGES } from '@/lib/messages';
import { sourceFiles } from './sourceChecks';

describe('T-NFR-2 the one error handler', () => {
  it('T-NFR-2 maps API statuses to the PRD 12.2 messages', () => {
    expect(mapApiError(401, 'anything')).toBe('You were logged out to keep your money details safe. Log in again.');
    expect(mapApiError(403, 'anything')).toBe("You can't do that.");
    expect(mapApiError(0, undefined)).toBe('Something went wrong. Try again.');
  });

  it('T-NFR-2 passes exact messages through and never shows raw errors', () => {
    expect(mapApiError(400, MESSAGES.questionTooLong)).toBe('Questions can be up to 500 characters.');
    for (const raw of ['PGRST116', 'duplicate key value violates unique constraint', 'TypeError: x is undefined', undefined]) {
      expect(mapApiError(500, raw)).toBe('Something went wrong. Try again.');
    }
  });

  it('T-NFR-2 database permission errors say not allowed; others use the screen message', () => {
    expect(mapDbError({ code: '42501', message: 'permission denied' }, 'fallback')).toBe("You can't do that.");
    expect(mapDbError({ code: '23514', message: 'check constraint' }, 'fallback')).toBe('fallback');
  });

  it('T-NFR-2 every /api error path uses a message from messages.ts', () => {
    const literals = sourceFiles('api').flatMap((f) => [...f.text.matchAll(/error:\s*['"`][^'"`]*['"`]/g)].map((m) => `${f.path}: ${m[0]}`));
    expect(literals).toEqual([]);
  });
});
