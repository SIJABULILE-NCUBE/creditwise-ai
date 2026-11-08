import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import { Toast } from '../components/Toast';
import * as authApi from '../lib/api/auth';
import { useAuth } from '../lib/authContext';
import { MESSAGES } from '../lib/messages';
import { validateEmail } from '../lib/rules/account';
import { clearSessionTimes } from '../lib/session';
import { useOnline } from '../lib/useOnline';

type Failure = 'wrong' | 'unverified' | 'locked' | 'server';

const FAILURE_TEXT: Record<Failure, string> = {
  wrong: MESSAGES.wrongDetails,
  unverified: MESSAGES.unverified,
  locked: MESSAGES.tooManyAttempts,
  server: MESSAGES.serverError,
};

const BANNERS = {
  verify: { text: MESSAGES.bannerVerify, variant: 'amber' },
  verified: { text: MESSAGES.bannerVerified, variant: 'green' },
  passwordChanged: { text: MESSAGES.bannerPasswordChanged, variant: 'green' },
  loggedOut: { text: MESSAGES.loggedOut, variant: 'amber' },
} as const;

export const S3LogIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const online = useOnline();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [resendWaiting, setResendWaiting] = useState(false);

  const verified = params.get('verified') === '1';
  const bannerKey = verified ? 'verified' : (location.state as { banner?: keyof typeof BANNERS } | null)?.banner;
  const banner = bannerKey ? BANNERS[bannerKey] : null;

  // The verification link signs the user in; PRD 7.1 has them log in normally afterwards.
  useEffect(() => {
    if (verified && session) void authApi.logOut();
  }, [verified, session]);

  useEffect(() => {
    if (!resendWaiting) return;
    const timer = setTimeout(() => setResendWaiting(false), 60_000);
    return () => clearTimeout(timer);
  }, [resendWaiting]);

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password && password.length === 0 ? MESSAGES.passwordRequired : null;
  const canSubmit = validateEmail(email) === null && password.length > 0 && online && failure !== 'locked';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setFailure(null);
    clearSessionTimes();
    const result = await authApi.logIn(email.trim().toLowerCase(), password);
    setSubmitting(false);
    if (!result.ok) setFailure(result.kind);
  };

  const resend = async () => {
    setResendWaiting(true);
    const sent = await authApi.resendVerification(email.trim().toLowerCase());
    setToast(sent ? MESSAGES.verificationSent : MESSAGES.serverError);
  };

  return (
    <div className="min-h-screen bg-pageBackground">
      <Header title="Log in" showBack onBack={() => navigate('/')} />
      <OfflineBanner />
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4 p-4" noValidate>
        {banner && <Banner message={banner.text} variant={banner.variant} />}
        <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={emailError ?? undefined} />
        <TextField label="Password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={passwordError ?? undefined} />
        <div className="text-right">
          <Link to="/forgot-password" className="inline-flex min-h-touch items-center text-base text-primary underline">
            Forgot password?
          </Link>
        </div>
        {failure && (
          <div role="alert" className="text-sm text-appError">
            <p>{FAILURE_TEXT[failure]}</p>
            {failure === 'unverified' && (
              <button type="button" onClick={resend} disabled={resendWaiting} className={`mt-1 min-h-touch underline ${resendWaiting ? 'cursor-not-allowed opacity-40' : ''}`}>
                Resend email
              </button>
            )}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={!canSubmit} loading={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
        <p className="text-center text-base text-secondaryText">
          New to CreditWise AI?{' '}
          <Link to="/sign-up" className="inline-flex min-h-touch items-center text-primary underline">
            Create an account
          </Link>
        </p>
      </form>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};
