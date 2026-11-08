import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AccountButton } from '../components/AccountButton';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import { StatCard } from '../components/StatCard';
import { StatusPill } from '../components/StatusPill';
import { Toast } from '../components/Toast';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { getMoneyProfile, type MoneyProfileData } from '../lib/api/moneyProfile';
import { getOpenFlagCount } from '../lib/api/transactions';
import { calculateDti, calculateMoneyLeft, calculateRoom, formatDti, getStatusBand, sumOf } from '../lib/calculations';
import { formatDateTime } from '../lib/dates';
import { takeFlash } from '../lib/flash';
import { formatMoney } from '../lib/money';
import { useOnline } from '../lib/useOnline';
import { M5WhatIf } from '../modals/M5WhatIf';

const SCALE_MAX = 60;

const percentOf = (part: number, whole: number) => Math.round((part / whole) * 100);

export const S6Snapshot: React.FC = () => {
  const navigate = useNavigate();
  const online = useOnline();
  const [data, setData] = useState<MoneyProfileData | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [toast, setToast] = useState<string | null>(null);
  const [openFlags, setOpenFlags] = useState(0);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    const result = await getMoneyProfile();
    setData(result);
    setStatus(result ? 'ready' : 'error');
  }, []);

  useEffect(() => {
    void load();
    void (async () => setOpenFlags((await getOpenFlagCount()) ?? 0))();
    const flash = takeFlash();
    if (flash) setToast(flash);
  }, [load]);

  return (
    <>
      <Header showLogo rightAction={<AccountButton />} />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4 tablet:p-6 desktop:max-w-desktop desktop:p-8">
        {status === 'loading' && (
          <div data-testid="snapshot-loading" className="space-y-4">
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3 text-center">
            <p className="text-base text-mainText">We couldn&apos;t load your Snapshot. Try again.</p>
            <Button onClick={load}>Try again</Button>
          </div>
        )}
        {status === 'ready' && data && <Figures data={data} online={online} openFlags={openFlags} onWhatIf={() => setWhatIfOpen(true)} onAsk={() => navigate('/ask')} onFlags={() => navigate('/transactions?filter=flagged')} />}
      </main>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {whatIfOpen && data && (
        <M5WhatIf
          data={data}
          onClose={(debtsChanged) => {
            setWhatIfOpen(false);
            if (debtsChanged) void load();
          }}
        />
      )}
    </>
  );
};

const Figures: React.FC<{ data: MoneyProfileData; online: boolean; openFlags: number; onWhatIf: () => void; onAsk: () => void; onFlags: () => void }> = ({ data, online, openFlags, onWhatIf, onAsk, onFlags }) => {
  const gross = data.profile.grossIncome as number;
  const net = data.profile.netIncome as number;
  const repayments = sumOf(data.debts, (d) => d.monthly_repayment);
  const expenses = sumOf(data.expenses, (e) => e.monthly_amount);
  const dti = calculateDti(repayments, gross);
  const band = getStatusBand(dti);
  const moneyLeft = calculateMoneyLeft(net, expenses, repayments);
  const room = calculateRoom(gross, repayments);
  const overspent = moneyLeft < 0;
  const barBase = overspent ? expenses + repayments : net;

  return (
    <>
      <div>
        <p className="text-2xl font-semibold text-mainText">Hi {data.firstName}</p>
        <p className="text-sm text-secondaryText">Updated {formatDateTime(data.profile.updatedAt)}</p>
      </div>

      <div className="space-y-4 desktop:grid desktop:grid-cols-2 desktop:gap-4 desktop:space-y-0">
        <Card className="space-y-3">
          <p className="text-sm text-secondaryText">Debt-to-income (DTI)</p>
          <p className="font-mono text-[40px] font-bold leading-none text-mainText">{formatDti(dti)}</p>
          <StatusPill band={band} />
          <div aria-hidden="true" className="relative h-2 rounded-pill bg-placeholder">
            <span className="absolute top-0 h-2 w-px bg-secondaryText" style={{ left: `${(30 / SCALE_MAX) * 100}%` }} />
            <span className="absolute top-0 h-2 w-px bg-secondaryText" style={{ left: `${(40 / SCALE_MAX) * 100}%` }} />
            <span className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-pill bg-primary" style={{ left: `${(Math.min(dti, SCALE_MAX) / SCALE_MAX) * 100}%` }} />
          </div>
          <span className="sr-only">{`Your DTI is ${formatDti(dti)}, in the ${band} band`}</span>
          <p className="text-base text-mainText">{`${formatMoney(repayments)} of your ${formatMoney(gross)} monthly income goes to debt repayments.`}</p>
          <p className="text-sm text-secondaryText">Bands are CreditWise&apos;s guide for learning, not a lender&apos;s rule.</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-mainText">Where your take-home pay goes</h2>
          <div aria-hidden="true" className="flex h-4 overflow-hidden rounded-pill bg-placeholder">
            <span className="bg-appWarning" style={{ width: `${(expenses / barBase) * 100}%` }} />
            <span className="bg-appError" style={{ width: `${(repayments / barBase) * 100}%` }} />
            {!overspent && <span className="bg-primary" style={{ width: `${(moneyLeft / barBase) * 100}%` }} />}
          </div>
          <ul className="space-y-1 text-sm text-mainText">
            <li>{`Expenses ${formatMoney(expenses)} (${percentOf(expenses, net)}%)`}</li>
            <li>{`Debt repayments ${formatMoney(repayments)} (${percentOf(repayments, net)}%)`}</li>
            {!overspent && <li>{`Money left ${formatMoney(moneyLeft)} (${percentOf(moneyLeft, net)}%)`}</li>}
          </ul>
          {overspent && <p className="text-sm text-appError">{`Over by ${formatMoney(-moneyLeft)} each month`}</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <StatCard label="Money left" value={moneyLeft} warning={overspent ? "You're spending more than you take home." : undefined} note="What's left from your take-home pay after expenses and debts." />
        <StatCard label="Room" value={room} warning={room === 0 ? 'You have no Room before the Red band.' : undefined} note="How much more you could add in monthly repayments before reaching Red." />
      </div>

      {openFlags > 0 && (
        <button type="button" onClick={onFlags} className="flex min-h-14 w-full items-center gap-3 rounded-card border border-appBorder bg-surface p-4 text-left text-base text-mainText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <AlertTriangle className="h-6 w-6 shrink-0 text-appWarning" aria-hidden="true" />
          <span className="flex-1">{`${openFlags} transactions need checking`}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-secondaryText" aria-hidden="true" />
        </button>
      )}

      {data.debts.length > 0 && (
        <Button variant="secondary" className="w-full" disabled={!online} onClick={onWhatIf}>
          What if I settle a debt?
        </Button>
      )}

      <Button className="w-full" disabled={!online} onClick={onAsk}>
        Ask about my Snapshot
      </Button>
      <Link to="/my-money" className="block min-h-touch py-3 text-center text-base text-primary underline">
        Edit my money
      </Link>
    </>
  );
};
