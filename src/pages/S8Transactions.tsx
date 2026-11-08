import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AccountButton } from '../components/AccountButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionTable } from '../components/TransactionTable';
import { listTransactions, type Transaction, type TransactionFilter } from '../lib/api/transactions';
import { formatPlainDate } from '../lib/dates';
import { notifyFlagsChanged } from '../lib/flagEvents';
import { useIsDesktop } from '../lib/useIsDesktop';
import { useOnline } from '../lib/useOnline';
import { M3AddTransactions } from '../modals/M3AddTransactions';
import { M4FlagDetails } from '../modals/M4FlagDetails';

export const S8Transactions: React.FC = () => {
  const online = useOnline();
  const desktop = useIsDesktop();
  const [params, setParams] = useSearchParams();
  const filter: TransactionFilter = params.get('filter') === 'flagged' ? 'flagged' : 'all';
  const [rows, setRows] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const load = useCallback(async () => {
    const result = await listTransactions(filter, 0);
    if (!result) {
      setStatus('error');
      return;
    }
    setRows(result.rows);
    setHasMore(result.hasMore);
    setFlaggedCount(result.flaggedCount);
    setPage(0);
    setStatus('ready');
  }, [filter]);

  useEffect(() => {
    setStatus('loading');
    void load();
  }, [load]);

  const showMore = async () => {
    const next = page + 1;
    const result = await listTransactions(filter, next);
    if (!result) return;
    setRows((current) => [...current, ...result.rows]);
    setHasMore(result.hasMore);
    setPage(next);
  };

  const changed = (message: string) => {
    setAddOpen(false);
    setSelected(null);
    setToast(message);
    notifyFlagsChanged();
    void load();
  };

  const chooseFilter = (next: TransactionFilter) => setParams(next === 'flagged' ? { filter: 'flagged' } : {}, { replace: true });
  const chipClass = (active: boolean) => `min-h-touch rounded-pill border px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? 'border-primary bg-primary text-white' : 'border-appBorder bg-surface text-mainText'}`;

  const groups = rows.reduce<{ date: string; rows: Transaction[] }[]>((all, row) => {
    const last = all[all.length - 1];
    if (last?.date === row.date) last.rows.push(row);
    else all.push({ date: row.date, rows: [row] });
    return all;
  }, []);

  return (
    <>
      <Header title="Transactions" rightAction={<AccountButton />} />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4 tablet:p-6 desktop:max-w-desktop desktop:p-8">
        <Button className="w-full tablet:w-auto" disabled={!online} onClick={() => setAddOpen(true)}>
          Add transactions
        </Button>
        <div className="flex gap-2">
          <button type="button" className={chipClass(filter === 'all')} onClick={() => chooseFilter('all')}>
            All
          </button>
          <button type="button" className={chipClass(filter === 'flagged')} onClick={() => chooseFilter('flagged')}>
            {`Flagged (${flaggedCount})`}
          </button>
        </div>
        <p className="text-sm text-secondaryText">Showing the last 90 days. Older transactions are deleted automatically.</p>

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <LoadingPlaceholder key={i} variant="row" />
            ))}
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3 text-center">
            <p className="text-base text-mainText">We couldn&apos;t load your transactions. Try again.</p>
            <Button
              onClick={() => {
                setStatus('loading');
                void load();
              }}
            >
              Try again
            </Button>
          </div>
        )}
        {status === 'ready' && rows.length === 0 && filter === 'all' && (
          <EmptyState message="No transactions yet. Upload your bank activity to check for double charges and unusual amounts." actionLabel="Add transactions" onAction={() => setAddOpen(true)} />
        )}
        {status === 'ready' && rows.length === 0 && filter === 'flagged' && <EmptyState message="Nothing to check right now. We'll flag anything unusual when you add transactions." />}
        {status === 'ready' && desktop && rows.length > 0 && <TransactionTable rows={rows} onOpen={setSelected} disabled={!online} />}
        {status === 'ready' &&
          !desktop &&
          groups.map((group) => (
            <section key={group.date}>
              <h2 className="py-1 text-sm font-semibold text-secondaryText">{formatPlainDate(group.date)}</h2>
              <div className="divide-y divide-appBorder rounded-card border border-appBorder bg-surface">
                {group.rows.map((row) => (
                  <TransactionRow key={row.id} transaction={row} onOpen={setSelected} disabled={!online} />
                ))}
              </div>
            </section>
          ))}
        {status === 'ready' && hasMore && (
          <Button variant="secondary" className="w-full" onClick={showMore}>
            Show more
          </Button>
        )}
      </main>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <M3AddTransactions isOpen={addOpen} onClose={() => setAddOpen(false)} onSaved={changed} />
      {selected && <M4FlagDetails transaction={selected} onClose={() => setSelected(null)} onChanged={changed} />}
    </>
  );
};
