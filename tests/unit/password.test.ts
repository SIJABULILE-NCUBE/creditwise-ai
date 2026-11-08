import { describe, it, expect } from 'vitest';
import { validatePassword, PASSWORD_ERROR } from '@/lib/rules/password';

describe('T-AUTH-1 password rule', () => {
  it('T-AUTH-1 accepts a valid password and refuses invalid ones with the exact message', () => {
    expect(validatePassword('creditwise1')).toBeNull();
    for (const bad of ['creditwise', '1234567890', 'abc12345']) {
      expect(validatePassword(bad)).toBe('At least 10 characters, with a letter and a number.');
    }
    expect(PASSWORD_ERROR).toBe('At least 10 characters, with a letter and a number.');
  });
});
