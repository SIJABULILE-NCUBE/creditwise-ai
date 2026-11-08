import { Router } from 'express';
import { buildContext, buildSystemPrompt, trimToWords, wrapQuestion } from '../lib/assistantPrompt.js';
import { askClaude } from '../lib/claude.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireUser } from '../middleware/requireUser.js';
import { todaySast } from '../../src/lib/dates.js';
import { MESSAGES } from '../../src/lib/messages.js';
import { sumOf } from '../../src/lib/calculations.js';
import { DAILY_QUESTION_LIMIT, LIMIT_REACHED, questionsLeft, validateQuestion } from '../../src/lib/rules/question.js';

export const askRouter = Router();

const UNAVAILABLE = MESSAGES.askUnavailable;
const HISTORY_SIZE = 10;
const MAX_ANSWER_WORDS = 200;
const MAX_STORED_ANSWER = 2000;

async function loadContext(userId: string) {
  const db = supabaseAdmin();
  const [profile, debts, expenses, flags] = await Promise.all([
    db.from('money_profiles').select('gross_income, net_income').eq('user_id', userId).single(),
    db.from('debts').select('type, monthly_repayment, balance_owing').eq('user_id', userId),
    db.from('expenses').select('monthly_amount').eq('user_id', userId),
    db.from('transactions').select('flag_type').eq('user_id', userId).eq('flag_status', 'open'),
  ]);
  if (profile.error || debts.error || expenses.error || flags.error || !profile.data.gross_income || !profile.data.net_income) return null;
  const openFlags = { double_charge: 0, higher_than_usual: 0, new_payee: 0 };
  for (const flag of flags.data as { flag_type: keyof typeof openFlags }[]) openFlags[flag.flag_type] += 1;
  return buildContext({
    grossIncome: profile.data.gross_income,
    netIncome: profile.data.net_income,
    totalExpenses: sumOf(expenses.data, (e) => e.monthly_amount),
    debts: debts.data.map((d) => ({ type: d.type, monthlyRepayment: d.monthly_repayment, balanceOwing: d.balance_owing })),
    openFlags,
  });
}

// OP20. The user is always the checked token's user (SEC15); the daily limit is checked before the AI is called.
askRouter.post('/', requireUser, async (req, res) => {
  const userId: string = res.locals.userId;
  const question = typeof req.body?.question === 'string' ? req.body.question : '';
  const invalid = validateQuestion(question);
  if (invalid || question.trim().length === 0) {
    res.status(400).json({ error: invalid ?? UNAVAILABLE });
    return;
  }

  const db = supabaseAdmin();
  const today = todaySast();
  const counter = await db.from('users').select('ask_count, ask_count_date').eq('id', userId).single();
  if (counter.error) {
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }
  const left = questionsLeft(counter.data.ask_count, counter.data.ask_count_date, today);
  if (left <= 0) {
    res.status(429).json({ error: LIMIT_REACHED });
    return;
  }

  const [context, history] = await Promise.all([
    loadContext(userId),
    db.from('chat_messages').select('role, text').eq('user_id', userId).order('created_at', { ascending: false }).limit(HISTORY_SIZE),
  ]);
  if (!context || history.error) {
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }

  const previous = [...history.data].reverse().map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.role === 'user' ? wrapQuestion(m.text) : m.text,
  }));
  // The conversation sent to the model has to start with a user message.
  while (previous[0]?.role === 'assistant') previous.shift();

  let answer: string;
  try {
    const reply = await askClaude({ system: buildSystemPrompt(context), messages: [...previous, { role: 'user', content: wrapQuestion(question) }] });
    answer = trimToWords(reply, MAX_ANSWER_WORDS).slice(0, MAX_STORED_ANSWER);
  } catch {
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }

  const now = Date.now();
  const saved = await db.from('chat_messages').insert([
    { user_id: userId, role: 'user', text: question, created_at: new Date(now).toISOString() },
    { user_id: userId, role: 'assistant', text: answer, created_at: new Date(now + 1).toISOString() },
  ]);
  const used = DAILY_QUESTION_LIMIT - left + 1;
  const counted = saved.error ? null : await db.from('users').update({ ask_count: used, ask_count_date: today }).eq('id', userId);
  if (saved.error || counted?.error) {
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }
  res.json({ answer, questionsLeft: DAILY_QUESTION_LIMIT - used });
});
