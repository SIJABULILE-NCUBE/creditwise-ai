/** BR8: when "See my snapshot" may be tapped. */
export function canCompleteSetup(state: {
  grossIncome: number | null;
  netIncome: number | null;
  expenseCount: number;
  debtCount: number;
  hasNoDebts: boolean;
}): boolean {
  return state.grossIncome !== null && state.netIncome !== null && state.expenseCount >= 1 && (state.debtCount >= 1 || state.hasNoDebts);
}
