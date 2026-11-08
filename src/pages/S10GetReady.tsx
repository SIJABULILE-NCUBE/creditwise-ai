import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { Button } from '../components/Button';
import { GuideCard } from '../components/GuideCard';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import { listGuides, type GuideDetail, type GuideSummary } from '../lib/api/guides';
import { M6Guide } from '../modals/M6Guide';

export const S10GetReady: React.FC = () => {
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [open, setOpen] = useState<GuideSummary | null>(null);
  const cache = useRef(new Map<string, GuideDetail>());

  const load = useCallback(async () => {
    const result = await listGuides();
    if (result) {
      setGuides(result);
      setStatus('ready');
    } else {
      setStatus((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const close = () => {
    setOpen(null);
    void load();
  };

  return (
    <>
      <Header title="Get Ready" rightAction={<AccountButton />} />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4">
        <p className="text-base text-mainText">Short guides on the most common types of credit, with a checklist of what to have ready before you apply.</p>
        {status === 'loading' && (
          <div data-testid="guides-loading" className="space-y-3">
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3 text-center">
            <p className="text-base text-mainText">We couldn&apos;t load the guides. Try again.</p>
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
        {status === 'ready' && guides.map((guide) => <GuideCard key={guide.slug} guide={guide} onOpen={setOpen} />)}
        <p className="text-sm text-secondaryText">You can get your credit report free once a year from each credit bureau.</p>
      </main>
      {open && <M6Guide slug={open.slug} title={open.title} onClose={close} cache={cache.current} />}
    </>
  );
};
