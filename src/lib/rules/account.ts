import { MESSAGES } from '../messages';

/** PRD 8.2 S2: one @ and a full stop after it. */
export function validateEmail(email: string): string | null {
  const parts = email.trim().split('@');
  const valid = parts.length === 2 && parts[0].length > 0 && /[^.]\.[^.]/.test(parts[1]);
  return valid ? null : MESSAGES.emailInvalid;
}

/** PRD 8.2 S2: 2 to 40 characters; letters, spaces, hyphens and apostrophes only. */
export function validateFirstName(firstName: string): string | null {
  const trimmed = firstName.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 40 && /^[A-Za-zÀ-ÿ' -]+$/.test(trimmed);
  return valid ? null : MESSAGES.firstNameInvalid;
}
