import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import * as authApi from '../lib/api/auth';
import { MESSAGES } from '../lib/messages';
import { validateEmail, validateFirstName } from '../lib/rules/account';
import { validatePassword } from '../lib/rules/password';
import { useOnline } from '../lib/useOnline';
import { M9PrivacyNotice } from '../modals/M9PrivacyNotice';

export const S2SignUp: React.FC = () => {
  const navigate = useNavigate();
  const online = useOnline();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [is18, setIs18] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({ firstName: false, email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<'exists' | 'server' | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const errors = {
    firstName: validateFirstName(firstName),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  const valid = !errors.firstName && !errors.email && !errors.password && is18 && agreed;
  const touch = (field: keyof typeof touched) => () => setTouched((t) => ({ ...t, [field]: true }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || !online) return;
    setSubmitting(true);
    setFailure(null);
    const result = await authApi.signUp({ firstName: firstName.trim(), email: email.trim().toLowerCase(), password });
    setSubmitting(false);
    if (result.ok) {
      navigate('/log-in', { state: { banner: 'verify' } });
    } else {
      setFailure(result.kind);
    }
  };

  return (
    <div className="min-h-screen bg-pageBackground">
      <Header title="Create your account" showBack onBack={() => navigate('/')} />
      <OfflineBanner />
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4 p-4" noValidate>
        <TextField label="First name" placeholder="e.g. Thando" value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={touch('firstName')} error={touched.firstName ? (errors.firstName ?? undefined) : undefined} />
        <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={touch('email')} error={touched.email ? (errors.email ?? undefined) : undefined} />
        <TextField
          label="Password"
          type="password"
          placeholder="At least 10 characters"
          helperText="At least 10 characters, with a letter and a number."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={touch('password')}
          error={touched.password ? (errors.password ?? undefined) : undefined}
        />
        <Checkbox checked={is18} onChange={(e) => setIs18(e.target.checked)}>
          I am 18 or older
        </Checkbox>
        <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
          I agree to the{' '}
          <button
            type="button"
            className="inline-flex min-h-touch items-center text-primary underline"
            onClick={(event) => {
              event.preventDefault();
              setPrivacyOpen(true);
            }}
          >
            Privacy Notice
          </button>
        </Checkbox>
        {failure === 'exists' && (
          <p className="text-sm text-appError" role="alert">
            <span>{MESSAGES.emailExists}</span>{' '}
            <Link to="/log-in" className="inline-flex min-h-touch items-center underline">
              Log in
            </Link>
          </p>
        )}
        {failure === 'server' && (
          <p className="text-sm text-appError" role="alert">
            {MESSAGES.serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={!valid || !online} loading={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-base text-secondaryText">
          Already have an account?{' '}
          <Link to="/log-in" className="inline-flex min-h-touch items-center text-primary underline">
            Log in
          </Link>
        </p>
      </form>
      <M9PrivacyNotice isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};
