import { supabase } from '../supabase';
import { todaySast } from '../dates';
import { mapDbError } from '../errors';
import { MESSAGES } from '../messages';
import { questionsLeft } from '../rules/question';
import { callApi } from './http';
import type { SaveResult } from './moneyProfile';

/** OP20 to OP22. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
}

export type AskResult = { ok: true; answer: string; questionsLeft: number } | { ok: false; error: string; limitReached: boolean };

export async function getChat(): Promise<{ messages: ChatMessage[]; questionsLeft: number } | null> {
  const [messages, user] = await Promise.all([
    supabase.from('chat_messages').select('id, role, text, created_at').order('created_at', { ascending: true }),
    supabase.from('users').select('ask_count, ask_count_date').single(),
  ]);
  if (messages.error || user.error) return null;
  return { messages: messages.data as ChatMessage[], questionsLeft: questionsLeft(user.data.ask_count, user.data.ask_count_date, todaySast()) };
}

export async function askQuestion(question: string): Promise<AskResult> {
  const result = await callApi<{ answer: string; questionsLeft: number }>('/api/ask', { method: 'POST', body: { question } });
  return result.ok ? { ok: true, ...result.data } : { ok: false, error: result.error, limitReached: result.status === 429 };
}

export async function clearChat(): Promise<SaveResult> {
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.from('chat_messages').delete().eq('user_id', data.session?.user.id);
  return error ? { ok: false, error: mapDbError(error, MESSAGES.deleteFailed) } : { ok: true };
}
