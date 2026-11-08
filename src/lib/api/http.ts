import { supabase } from '../supabase';
import { MESSAGES } from '../messages';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

/** Calls the Express API with the current login token. */
export async function callApi<T>(path: string, init: { method: string; body?: unknown }): Promise<ApiResult<T>> {
  try {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(path, {
      method: init.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session?.access_token ?? ''}`,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (res.status === 204) return { ok: true, data: undefined as T };
    const json = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, status: res.status, error: json?.error ?? MESSAGES.serverError };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, status: 0, error: MESSAGES.serverError };
  }
}
