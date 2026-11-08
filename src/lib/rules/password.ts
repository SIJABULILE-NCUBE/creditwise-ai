export const PASSWORD_ERROR = 'At least 10 characters, with a letter and a number.';

/** PRD Section 5: at least 10 characters, with at least 1 letter and 1 number. */
export function validatePassword(password: string): string | null {
  const valid = password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);
  return valid ? null : PASSWORD_ERROR;
}
