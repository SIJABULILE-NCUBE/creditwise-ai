import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Key, LogOut, Shield, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { InitialAvatar } from '../components/InitialAvatar';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import { SettingsRow } from '../components/SettingsRow';
import { Toast } from '../components/Toast';
import * as authApi from '../lib/api/auth';
import { deleteAllTransactions, getTransactionCount } from '../lib/api/transactions';
import { notifyFlagsChanged } from '../lib/flagEvents';
import { useAuth } from '../lib/authContext';
import { MESSAGES } from '../lib/messages';
import { clearSessionTimes } from '../lib/session';
import { useOnline } from '../lib/useOnline';
import { M7DeleteAccount } from '../modals/M7DeleteAccount';
import { M8ConfirmDelete } from '../modals/M8ConfirmDelete';
import { M9PrivacyNotice } from '../modals/M9PrivacyNotice';

export const S12Account: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const online = useOnline();
  const { account, markSignedOut } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [modal, setModal] = useState<'privacy' | 'delete' | 'transactions' | null>(null);
  const [transactionCount, setTransactionCount] = useState(0);

  const loadCount = useCallback(async () => setTransactionCount((await getTransactionCount()) ?? 0), []);

  useEffect(() => {
    void loadCount();
  }, [loadCount]);

  const from = (location.state as { from?: string } | null)?.from ?? '/snapshot';

  const changePassword = async () => {
    setFailure(null);
    const sent = account ? await authApi.requestPasswordReset(account.email) : false;
    if (sent) setToast(MESSAGES.resetSentToast);
    else setFailure(MESSAGES.serverError);
  };

  const logOut = async () => {
    await authApi.logOut();
    clearSessionTimes();
    markSignedOut?.();
    navigate('/', { replace: true });
  };

  return (
    <>
      <Header title="Account" showBack onBack={() => navigate(from)} />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4">
        <div className="flex items-center gap-3">
          {account ? (
            <>
              <InitialAvatar name={account.firstName} size="lg" />
              <div>
                <p className="text-lg font-semibold text-mainText">{account.firstName}</p>
                <p className="text-sm text-secondaryText">{account.email}</p>
              </div>
            </>
          ) : (
            <LoadingPlaceholder variant="row" />
          )}
        </div>
        <Card className="divide-y divide-appBorder py-1">
          <SettingsRow icon={Key} label="Change password" onClick={changePassword} disabled={!online} />
          <SettingsRow icon={Shield} label="Privacy Notice" onClick={() => setModal('privacy')} />
          {transactionCount > 0 && <SettingsRow icon={Trash2} label="Delete all transactions" variant="error" onClick={() => setModal('transactions')} disabled={!online} />}
          <SettingsRow icon={LogOut} label="Log out" onClick={logOut} />
        </Card>
        {failure && (
          <p role="alert" className="text-sm text-appError">
            {failure}
          </p>
        )}
        <Button variant="danger" className="w-full" disabled={!online} onClick={() => setModal('delete')}>
          Delete account
        </Button>
        <p className="text-center text-sm text-secondaryText">CreditWise AI v1.0. Your data is stored in London, United Kingdom.</p>
      </main>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <M9PrivacyNotice isOpen={modal === 'privacy'} onClose={() => setModal(null)} />
      <M7DeleteAccount isOpen={modal === 'delete'} onClose={() => setModal(null)} />
      <M8ConfirmDelete
        isOpen={modal === 'transactions'}
        title="Delete all transactions?"
        body={`This deletes all ${transactionCount} transactions and their flags. You can't undo this.`}
        onConfirm={deleteAllTransactions}
        onDone={() => {
          setModal(null);
          setToast('All transactions deleted.');
          notifyFlagsChanged();
          void loadCount();
        }}
        onCancel={() => setModal(null)}
      />
    </>
  );
};
