import { describe, it, expect } from 'vitest';
import { questionsLeft, validateQuestion } from '@/lib/rules/question';

describe('BR15 question limits', () => {
  it('T-BR15-1 allows 1 to 500 characters', () => {
    expect(validateQuestion('a')).toBeNull();
    expect(validateQuestion('a'.repeat(500))).toBeNull();
    expect(validateQuestion('a'.repeat(501))).toBe('Questions can be up to 500 characters.');
  });

  it('T-BR15-1 questions left is 20 minus the count, and an earlier SAST date counts as 0', () => {
    expect(questionsLeft(2, '2026-11-08', '2026-11-08')).toBe(18);
    expect(questionsLeft(20, '2026-11-08', '2026-11-08')).toBe(0);
    expect(questionsLeft(20, '2026-11-07', '2026-11-08')).toBe(20);
    expect(questionsLeft(0, null, '2026-11-08')).toBe(20);
  });
});
