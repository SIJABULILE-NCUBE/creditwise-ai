import { describe, it, expect } from 'vitest';
import { checklistProgress } from '@/lib/rules/checklist';

describe('BR19 checklist', () => {
  it('T-BR19-1 shows the progress text, and Not started at 0 ticks', () => {
    expect(checklistProgress(2, 6)).toBe('2 of 6 done');
    expect(checklistProgress(6, 6)).toBe('6 of 6 done');
    expect(checklistProgress(0, 6)).toBe('Not started');
  });
});
