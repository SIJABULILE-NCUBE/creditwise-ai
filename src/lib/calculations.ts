/** BR4 to BR7. All money arithmetic is done in whole cents so results don't drift. */
export type StatusBand = 'green' | 'amber' | 'red';

export const STATUS_LABELS: Record<StatusBand, string> = {
  green: 'Green: healthy',
  amber: 'Amber: getting stretched',
  red: 'Red: lenders may decline',
};

const cents = (rand: number) => Math.round(rand * 100);

export function calculateDti(totalRepayments: number, grossIncome: number): number {
  return Math.round((cents(totalRepayments) * 100) / cents(grossIncome));
}

export function getStatusBand(dti: number): StatusBand {
  if (dti <= 30) return 'green';
  return dti <= 40 ? 'amber' : 'red';
}

export function calculateMoneyLeft(netIncome: number, totalExpenses: number, totalRepayments: number): number {
  return (cents(netIncome) - cents(totalExpenses) - cents(totalRepayments)) / 100;
}

export function calculateRoom(grossIncome: number, totalRepayments: number): number {
  return Math.max(0, Math.floor((cents(grossIncome) * 40 - cents(totalRepayments) * 100) / 10000));
}

export function formatDti(dti: number): string {
  return dti > 999 ? '999%+' : `${dti}%`;
}

export function sumOf<T>(items: T[], amount: (item: T) => number): number {
  return items.reduce((total, item) => total + cents(amount(item)), 0) / 100;
}

export interface SnapshotFigures {
  dti: number;
  band: StatusBand;
  moneyLeft: number;
  room: number;
}

export interface WhatIfInput {
  grossIncome: number;
  netIncome: number;
  totalExpenses: number;
  debts: { id: string; monthly_repayment: number }[];
}

function figuresFor(input: WhatIfInput, repayments: number): SnapshotFigures {
  const dti = calculateDti(repayments, input.grossIncome);
  return { dti, band: getStatusBand(dti), moneyLeft: calculateMoneyLeft(input.netIncome, input.totalExpenses, repayments), room: calculateRoom(input.grossIncome, repayments) };
}

/** BR18: the figures now, and as if the ticked debts' repayments were R0.00. Nothing is saved. */
export function calculateWhatIf(input: WhatIfInput, tickedDebtIds: string[]): { before: SnapshotFigures; after: SnapshotFigures } {
  const remaining = input.debts.filter((debt) => !tickedDebtIds.includes(debt.id));
  return {
    before: figuresFor(input, sumOf(input.debts, (d) => d.monthly_repayment)),
    after: figuresFor(input, sumOf(remaining, (d) => d.monthly_repayment)),
  };
}
