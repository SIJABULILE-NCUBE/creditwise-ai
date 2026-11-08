import { supabase } from '../supabase';
import { callApi } from './http';

/** OP1 to OP7, plus the session helpers the app needs. */
export interface SessionInfo {
  userId: string;
  email: string;
}

export interface AccountInfo {
  firstName: string;
  email: string;
  completed: boolean;
  setupStep: number;
}

export type SignUpResult = { ok: true } | { ok: false; kind: 'exists' | 'server' };
export type LogInResult = { ok: true } | { ok: false; kind: 'wrong' | 'unverified' | 'locked' | 'server' };
export type SetPasswordResult = { ok: true } | { ok: false; kind: 'expired' | 'server' };

function appUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

export async function signUp(input: { firstName: string; email: string; password: string }): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { first_name: input.firstName, is_18_or_older: true },
      emailRedirectTo: appUrl('/log-in?verified=1'),
    },
  });
  if (error) return { ok: false, kind: error.code === 'user_already_exists' ? 'exists' : 'server' };
  // With email confirmation on, Supabase hides an existing account by returning a user with no identities.
  if (data.user?.identities?.length === 0) return { ok: false, kind: 'exists' };
  return { ok: true };
}

export async function logIn(email: string, password: string): Promise<LogInResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return { ok: true };
  if (error.code === 'email_not_confirmed') return { ok: false, kind: 'unverified' };
  if (error.status === 429) return { ok: false, kind: 'locked' };
  if (error.code === 'invalid_credentials') return { ok: false, kind: 'wrong' };
  return { ok: false, kind: 'server' };
}

export async function resendVerification(email: string): Promise<boolean> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: appUrl('/log-in?verified=1') },
  });
  return !error;
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl('/set-new-password') });
  return !error;
}

export async function setNewPassword(password: string): Promise<SetPasswordResult> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const expired = error.code === 'session_not_found' || error.code === 'bad_jwt' || error.name === 'AuthSessionMissingError';
    return { ok: false, kind: expired ? 'expired' : 'server' };
  }
  await supabase.auth.signOut({ scope: 'global' });
  return { ok: true };
}

export async function logOut(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
}

export async function deleteAccount(): Promise<boolean> {
  const result = await callApi<void>('/api/account', { method: 'DELETE' });
  if (!result.ok) return false;
  await supabase.auth.signOut({ scope: 'local' });
  return true;
}

export async function getSession(): Promise<SessionInfo | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ? { userId: data.session.user.id, email: data.session.user.email ?? '' } : null;
}

export function onAuthChange(listener: (event: string, session: SessionInfo | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    listener(event, session ? { userId: session.user.id, email: session.user.email ?? '' } : null);
  });
  return () => data.subscription.unsubscribe();
}

export async function getAccount(): Promise<AccountInfo | null> {
  const [user, profile] = await Promise.all([
    supabase.from('users').select('first_name, email').single(),
    supabase.from('money_profiles').select('completed_at, setup_step').single(),
  ]);
  if (user.error || profile.error) return null;
  return {
    firstName: user.data.first_name,
    email: user.data.email,
    completed: profile.data.completed_at !== null,
    setupStep: profile.data.setup_step,
  };
}
