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
