import React, { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { OfflineBanner } from '../components/OfflineBanner';
import type { SaveResult } from '../lib/api/moneyProfile';
import { useOnline } from '../lib/useOnline';

export interface M8ConfirmDeleteProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<SaveResult>;
  onDone: () => void;
  onCancel: () => void;
}

export const M8ConfirmDelete: React.FC<M8ConfirmDeleteProps> = ({ isOpen, title, body, confirmLabel = 'Delete', onConfirm, onDone, onCancel }) => {
  const online = useOnline();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setDeleting(true);
    setError(null);
    const result = await onConfirm();
    setDeleting(false);
    if (result.ok) onDone();
    else setError(result.error);
  };

  const cancel = () => {
    setError(null);
    onCancel();
  };

  return (
    <ConfirmModal isOpen={isOpen} title={title} body={body} confirmLabel={confirmLabel} loading={deleting} confirmDisabled={!online} error={error} onConfirm={confirm} onCancel={cancel}>
      {!online && <OfflineBanner />}
    </ConfirmModal>
  );
};
