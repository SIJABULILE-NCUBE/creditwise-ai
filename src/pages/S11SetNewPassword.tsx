import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import * as authApi from '../lib/api/auth';
import { useAuth } from '../lib/authContext';
import { MESSAGES } from '../lib/messages';
import { PASSWORD_ERROR, validatePassword } from '../lib/rules/password';
import { useOnline } from '../lib/useOnline';

export const S11SetNewPassword: React.FC = () => {
  const navigate = useNavigate();
  const online = useOnline();
  const { recovery, clearRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<'expired' | 'server' | null>(null);

  const passwordValid = validatePassword(password) === null;
  const matches = password === confirm;
  const expired = !recovery || failure === 'expired';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordValid || !matches || !online) return;
    setSaving(true);
    setFailure(null);
    const result = await authApi.setNewPassword(password);
    setSaving(false);
    if (result.ok) {
      clearRecovery();
      navigate('/log-in', { replace: true, state: { banner: 'passwordChanged' } });
    } else {
      setFailure(result.kind);
    }
  };

  return (
    <div className="min-h-screen bg-pageBackground">
      <OfflineBanner />
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex justify-center py-4">
          <Logo height={32} />
        </div>
        <h1 className="text-center text-2xl font-semibold text-mainText">Choose a new password</h1>
        {expired ? (
          <>
            <p className="text-center text-base text-mainText">{MESSAGES.linkExpired}</p>
            <Button className="w-full" onClick={() => navigate('/forgot-password')}>
              Send a new link
            </Button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <TextField label="New password" type="password" placeholder="At least 10 characters" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={touched.password && !passwordValid ? PASSWORD_ERROR : undefined} />
            <TextField label="Confirm new password" type="password" placeholder="Type it again" value={confirm} onChange={(e) => setConfirm(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, confirm: true }))} error={touched.confirm && !matches ? MESSAGES.passwordMismatch : undefined} />
            {failure === 'server' && (
              <p role="alert" className="text-sm text-appError">
                {MESSAGES.serverError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!passwordValid || !matches || !online} loading={saving}>
              {saving ? 'Saving…' : 'Save password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
