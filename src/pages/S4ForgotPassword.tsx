import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import * as authApi from '../lib/api/auth';
import { MESSAGES } from '../lib/messages';
import { validateEmail } from '../lib/rules/account';
import { useOnline } from '../lib/useOnline';

export const S4ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const online = useOnline();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = validateEmail(email);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (emailError || !online) return;
    setSending(true);
    setFailed(false);
    const ok = await authApi.requestPasswordReset(email.trim().toLowerCase());
    setSending(false);
    if (ok) setSent(true);
    else setFailed(true);
  };

  const backLink = (
    <Link to="/log-in" className="block min-h-touch py-3 text-center text-base text-primary underline">
      Back to log in
    </Link>
  );

  return (
    <div className="min-h-screen bg-pageBackground">
      <Header title="Reset your password" showBack onBack={() => navigate('/log-in')} />
      <OfflineBanner />
      <div className="mx-auto max-w-md space-y-4 p-4">
        {sent ? (
          <>
            <Banner message={MESSAGES.resetSent} />
            {backLink}
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <p className="text-base text-secondaryText">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
            <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} error={touched && emailError ? emailError : undefined} />
            {failed && (
              <p role="alert" className="text-sm text-appError">
                {MESSAGES.serverError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={Boolean(emailError) || !online} loading={sending}>
              {sending ? 'Sending…' : 'Send link'}
            </Button>
            {backLink}
          </form>
        )}
      </div>
    </div>
  );
};
