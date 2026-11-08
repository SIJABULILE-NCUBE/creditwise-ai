import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { FlagPill } from '../components/FlagPill';
import { Modal } from '../components/Modal';
import { OfflineBanner } from '../components/OfflineBanner';
import { getEarlierPayments, setFlagStatus, type Transaction } from '../lib/api/transactions';
import { formatDate, formatPlainDate } from '../lib/dates';
import { formatMoney } from '../lib/money';
import { FLAG_REASONS, flagExplanation, type FlagStatus, type Payment } from '../lib/rules/flags';
import { useOnline } from '../lib/useOnline';

export interface M4FlagDetailsProps {
  transaction: Transaction;
  onClose: () => void;
  onChanged: (toast: string) => void;
}

function statusLine(transaction: Transaction): string {
  switch (transaction.flag_status) {
    case 'querying':
      return 'Status: Querying';
    case 'dismissed':
      return 'Status: Dismissed';
    case 'resolved':
      return `Status: Sorted on ${transaction.flag_status_changed_at ? formatDate(transaction.flag_status_changed_at) : ''}`.trim();
    default:
      return 'Status: Open';
  }
}

export const M4FlagDetails: React.FC<M4FlagDetailsProps> = ({ transaction, onClose, onChanged }) => {
  const online = useOnline();
  const [earlier, setEarlier] = useState<Payment[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getEarlierPayments(transaction).then((payments) => {
      if (active) setEarlier(payments);
    });
    return () => {
      active = false;
    };
  }, [transaction]);

  if (transaction.flag_type === 'none') return null;

  const change = async (status: FlagStatus, toast: string) => {
    setBusy(true);
    setError(null);
    const result = await setFlagStatus(transaction.id, status);
    setBusy(false);
    if (result.ok) onChanged(toast);
    else setError(result.error);
  };

  const disabled = !online || busy;

  return (
    <Modal isOpen onClose={onClose} variant="bottomSheet" maxWidth="480" title={FLAG_REASONS[transaction.flag_type]} titleNode={<FlagPill type={transaction.flag_type} status={transaction.flag_status} />}>
      <OfflineBanner />
      <div className="space-y-3">
        <p className="font-semibold text-mainText">{`${transaction.description} · ${formatPlainDate(transaction.date)} · ${formatMoney(transaction.amount)}`}</p>
        {earlier && <p className="text-base text-mainText">{flagExplanation(transaction, earlier)}</p>}
        <p className="text-sm text-secondaryText">{statusLine(transaction)}</p>
        {error && (
          <p role="alert" className="text-sm text-appError">
            {error}
          </p>
        )}
        {transaction.flag_status === 'open' && (
          <>
            <Button className="w-full" disabled={disabled} onClick={() => change('querying', 'Marked as querying. Contact your bank to ask about it.')}>
              I&apos;ll query it
            </Button>
            <Button variant="secondary" className="w-full" disabled={disabled} onClick={() => change('dismissed', 'Marked as fine.')}>
              Looks fine
            </Button>
          </>
        )}
        {transaction.flag_status === 'querying' && (
          <Button className="w-full" disabled={disabled} onClick={() => change('resolved', 'Marked as sorted.')}>
            Sorted
          </Button>
        )}
        {transaction.flag_status === 'dismissed' && (
          <Button variant="secondary" className="w-full" disabled={disabled} onClick={() => change('open', 'Flag reopened.')}>
            Undo
          </Button>
        )}
      </div>
    </Modal>
  );
};
