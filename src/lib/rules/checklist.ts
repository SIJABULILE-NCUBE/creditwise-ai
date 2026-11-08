/** BR19: progress text for a guide's checklist. */
export function checklistProgress(done: number, total: number): string {
  return done === 0 ? 'Not started' : `${done} of ${total} done`;
}
