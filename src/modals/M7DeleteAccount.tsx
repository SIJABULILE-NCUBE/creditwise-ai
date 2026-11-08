import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ConfirmModal } from '../components/ConfirmModal';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import * as authApi from '../lib/api/auth';
import { useAuth } from '../lib/authContext';
import { MESSAGES } from '../lib/messages';
import { clearSessionTimes } from '../lib/session';
import { useOnline } from '../lib/useOnline';

export const M7DeleteAccount: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const online = useOnline();
  const { markSignedOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setTyped('');
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setDeleting(true);
    setError(null);
    const deleted = await authApi.deleteAccount();
    setDeleting(false);
    if (!deleted) {
      setError(MESSAGES.accountDeleteFailed);
      return;
    }
    clearSessionTimes();
    markSignedOut?.('deleted');
    navigate('/', { replace: true, state: { deleted: true } });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Delete your account?"
      body="This permanently deletes your money profile, debts, expenses, transactions, checklist ticks and Ask CreditWise messages. You can't undo this."
      confirmLabel={deleting ? 'Deleting…' : 'Delete my account'}
      loading={deleting}
      confirmDisabled={typed !== 'DELETE' || !online}
      error={error}
      onConfirm={confirm}
      onCancel={close}
    >
      <OfflineBanner />
      <TextField label="Type DELETE to confirm" placeholder="DELETE" value={typed} onChange={(e) => setTyped(e.target.value)} />
    </ConfirmModal>
  );
};
