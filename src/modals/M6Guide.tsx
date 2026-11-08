import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { Markdown } from '../components/Markdown';
import { Modal } from '../components/Modal';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';
import { getGuide, setTick, type GuideDetail } from '../lib/api/guides';
import { checklistProgress } from '../lib/rules/checklist';
import { useOnline } from '../lib/useOnline';

export interface M6GuideProps {
  slug: string;
  title: string;
  onClose: () => void;
  /** Guides loaded in this visit, so a guide can still be read offline. */
  cache?: Map<string, GuideDetail>;
}

export const M6Guide: React.FC<M6GuideProps> = ({ slug, title, onClose, cache }) => {
  const online = useOnline();
  const [guide, setGuide] = useState<GuideDetail | null>(() => cache?.get(slug) ?? null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const savesInFlight = useRef(new Set<Promise<unknown>>());

  useEffect(() => {
    let active = true;
    void getGuide(slug).then((loaded) => {
      if (!active) return;
      if (loaded) {
        setGuide(loaded);
        cache?.set(slug, loaded);
      } else if (!cache?.has(slug)) {
        setFailed(true);
      }
    });
    return () => {
      active = false;
    };
  }, [slug, cache]);

  const applyTick = (itemId: string, ticked: boolean) => {
    setGuide((current) => {
      if (!current) return current;
      const next = { ...current, items: current.items.map((item) => (item.id === itemId ? { ...item, ticked } : item)) };
      cache?.set(slug, next);
      return next;
    });
  };

  const toggle = async (itemId: string, ticked: boolean) => {
    applyTick(itemId, ticked);
    const saving = setTick(itemId, ticked);
    savesInFlight.current.add(saving);
    const result = await saving;
    savesInFlight.current.delete(saving);
    if (!result.ok) {
      applyTick(itemId, !ticked);
      setToast("We couldn't save that tick. Try again.");
    }
  };

  // S10 reloads its progress on close, so every tick has to be saved first.
  const close = async () => {
    await Promise.allSettled(savesInFlight.current);
    onClose();
  };

  const done = guide?.items.filter((item) => item.ticked).length ?? 0;
  const total = guide?.items.length ?? 0;

  return (
    <Modal isOpen onClose={close} title={title} maxWidth="720">
      <OfflineBanner />
      {!guide && !failed && (
        <div data-testid="guide-loading" className="space-y-2">
          <LoadingPlaceholder />
          <LoadingPlaceholder />
          <LoadingPlaceholder />
        </div>
      )}
      {!guide && failed && <p className="text-base text-mainText">We couldn&apos;t load the guides. Try again.</p>}
      {guide && (
        <>
          <Markdown text={guide.body} />
          <h3 className="mb-2 mt-4 text-lg font-semibold text-mainText">Before you apply</h3>
          <div className="h-2 rounded-pill bg-placeholder">
            <div className="h-2 rounded-pill bg-primary" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <p className="mb-2 mt-1 text-sm text-secondaryText">{checklistProgress(done, total)}</p>
          {guide.items.map((item) => (
            <Checkbox key={item.id} checked={item.ticked} disabled={!online} onChange={(e) => toggle(item.id, e.target.checked)}>
              {item.text}
            </Checkbox>
          ))}
        </>
      )}
      <Button variant="secondary" className="mt-4 w-full" onClick={close}>
        Close
      </Button>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </Modal>
  );
};
