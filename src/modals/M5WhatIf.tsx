import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Modal } from '../components/Modal';
import { OfflineBanner } from '../components/OfflineBanner';
import { StatusPill } from '../components/StatusPill';
import { getMoneyProfile, type Debt, type MoneyProfileData } from '../lib/api/moneyProfile';
import { calculateWhatIf, formatDti, sumOf, type StatusBand } from '../lib/calculations';
import { formatMoney } from '../lib/money';
import { useOnline } from '../lib/useOnline';

const BAND_WORDS: Record<StatusBand, string> = { green: 'Green', amber: 'Amber', red: 'Red' };

const debtsSignature = (debts: Debt[]) =>
  debts
    .map((d) => `${d.id}:${d.monthly_repayment}`)
    .sort()
    .join('|');

const moneyClass = (amount: number) => `font-mono ${amount < 0 ? 'text-appError' : 'text-mainText'}`;

export interface M5WhatIfProps {
  data: MoneyProfileData;
  /** Told whether the debts changed elsewhere, so S6 can show the saved figures again. */
  onClose: (debtsChanged: boolean) => void;
}

export const M5WhatIf: React.FC<M5WhatIfProps> = ({ data, onClose }) => {
  const online = useOnline();
  const [ticked, setTicked] = useState<string[]>([]);
  const [changed, setChanged] = useState(false);

  const { before, after } = calculateWhatIf(
    {
      grossIncome: data.profile.grossIncome as number,
      netIncome: data.profile.netIncome as number,
      totalExpenses: sumOf(data.expenses, (e) => e.monthly_amount),
      debts: data.debts,
    },
    ticked,
  );
  const hasTicks = ticked.length > 0;

  const toggle = (id: string) => {
    if (changed) {
      onClose(true);
      return;
    }
    setTicked((current) => (current.includes(id) ? current.filter((t) => t !== id) : [...current, id]));
    if (!online) return;
    void getMoneyProfile().then((latest) => {
      if (latest && debtsSignature(latest.debts) !== debtsSignature(data.debts)) setChanged(true);
    });
  };

  // The table reads Now and After as columns; each sr-only line gives the same pair as one phrase.
  const rows = [
    { label: 'DTI', now: <span className="font-mono text-mainText">{formatDti(before.dti)}</span>, later: <span className="font-mono text-mainText">{formatDti(after.dti)}</span>, phrase: `${formatDti(before.dti)} → ${formatDti(after.dti)}` },
    { label: 'Status band', now: <StatusPill band={before.band} />, later: <StatusPill band={after.band} />, phrase: `${BAND_WORDS[before.band]} → ${BAND_WORDS[after.band]}` },
    { label: 'Money left', now: <span className={moneyClass(before.moneyLeft)}>{formatMoney(before.moneyLeft)}</span>, later: <span className={moneyClass(after.moneyLeft)}>{formatMoney(after.moneyLeft)}</span>, phrase: `${formatMoney(before.moneyLeft)} → ${formatMoney(after.moneyLeft)}` },
    { label: 'Room', now: <span className="font-mono text-mainText">{formatMoney(before.room)}</span>, later: <span className="font-mono text-mainText">{formatMoney(after.room)}</span>, phrase: `${formatMoney(before.room)} → ${formatMoney(after.room)}` },
  ];

  return (
    <Modal isOpen onClose={() => onClose(changed)} title="What if I settle a debt?" maxWidth="560">
      <OfflineBanner />
      <p className="mb-2 text-base text-mainText">Tick the debts you&apos;re thinking of paying off. Nothing is saved.</p>
      {data.debts.map((debt) => (
        <Checkbox key={debt.id} checked={ticked.includes(debt.id)} onChange={() => toggle(debt.id)}>
          {debt.name} <span className="font-mono text-sm text-secondaryText">{formatMoney(debt.monthly_repayment)} a month</span>
        </Checkbox>
      ))}

      {changed && (
        <p role="alert" className="mt-3 text-sm text-appError">
          Your debts changed. Close and open What if again.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-secondaryText">
              <th scope="col" className="py-1 pr-2 font-medium">
                <span className="sr-only">Figure</span>
              </th>
              <th scope="col" className="py-1 pr-2 font-medium">
                Now
              </th>
              <th scope="col" className="py-1 font-medium">
                After
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-appBorder">
            {rows.map((row, index) => (
              <tr key={row.label}>
                <th scope="row" className="py-2 pr-2 font-medium text-mainText">
                  {row.label}
                </th>
                <td className="py-2 pr-2">{row.now}</td>
                {hasTicks ? (
                  <td className="py-2">
                    {row.later}
                    <span className="sr-only">{row.phrase}</span>
                  </td>
                ) : (
                  index === 0 && (
                    <td rowSpan={rows.length} className="py-2 align-middle text-secondaryText">
                      Tick a debt to see the change.
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-secondaryText">This is a guide. Settling a debt early may have fees; ask your lender for a settlement letter.</p>
      <Button variant="secondary" className="mt-4 w-full" onClick={() => onClose(changed)}>
        Close
      </Button>
    </Modal>
  );
};
