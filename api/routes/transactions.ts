import { Router } from 'express';
import { CSV_MESSAGES, parseCsvImport, selectNewRows, type CsvRow } from '../lib/csv.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireUser } from '../middleware/requireUser.js';
import { todaySast } from '../../src/lib/dates.js';
import { MESSAGES } from '../../src/lib/messages.js';
import { validateManualTransaction } from '../../src/lib/rules/transaction.js';

export const transactionsRouter = Router();

// Every query below is scoped to res.locals.userId, from the checked token (SEC16).
transactionsRouter.post('/import', requireUser, async (req, res) => {
  const userId: string = res.locals.userId;
  const parsed = parseCsvImport({ fileName: String(req.body?.fileName ?? ''), csvText: String(req.body?.csvText ?? ''), today: todaySast() });
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const stored = await supabaseAdmin().from('transactions').select('date, description, amount').eq('user_id', userId).limit(1000);
  if (stored.error) {
    res.status(500).json({ error: MESSAGES.serverError });
    return;
  }
  const newRows = selectNewRows(parsed.rows, stored.data as CsvRow[]);
  const skipped = parsed.skipped + parsed.rows.length - newRows.length;
  if (stored.data.length + newRows.length > 1000) {
    res.status(400).json({ error: CSV_MESSAGES.overLimit });
    return;
  }
  if (newRows.length === 0) {
    res.json({ added: 0, skipped, needChecking: 0 });
    return;
  }

  // Rising timestamps keep file order, so "the second one in the file" (BR11) is well defined.
  const batchStart = Date.now();
  const { error } = await supabaseAdmin()
    .from('transactions')
    .insert(newRows.map((row, i) => ({ ...row, user_id: userId, source: 'csv', created_at: new Date(batchStart + i).toISOString() })));
  const flags = error ? null : await supabaseAdmin().rpc('recalculate_flags', { p_user_id: userId });
  if (error || flags?.error) {
    res.status(500).json({ error: MESSAGES.serverError });
    return;
  }

  const open = await supabaseAdmin()
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('flag_status', 'open')
    .gte('created_at', new Date(batchStart).toISOString());
  res.json({ added: newRows.length, skipped, needChecking: open.count ?? 0 });
});

transactionsRouter.post('/', requireUser, async (req, res) => {
  const userId: string = res.locals.userId;
  const { date, description, amount, direction } = req.body ?? {};
  const input = { date: String(date ?? ''), description: String(description ?? ''), amount: typeof amount === 'number' ? amount : null };
  const errors = validateManualTransaction(input, todaySast());
  const firstError = errors.date ?? errors.description ?? errors.amount;
  if (firstError || (direction !== 'in' && direction !== 'out')) {
    res.status(400).json({ error: firstError ?? MESSAGES.serverError });
    return;
  }

  const { error } = await supabaseAdmin()
    .from('transactions')
    .insert({ user_id: userId, date: input.date, description: input.description, amount: direction === 'out' ? -(input.amount as number) : input.amount, source: 'manual' });
  const flags = error ? null : await supabaseAdmin().rpc('recalculate_flags', { p_user_id: userId });
  if (error || flags?.error) {
    res.status(500).json({ error: error?.message.includes('limit_transactions') ? CSV_MESSAGES.overLimit : MESSAGES.serverError });
    return;
  }
  res.status(201).json({ ok: true });
});

transactionsRouter.delete('/', requireUser, async (_req, res) => {
  const { error } = await supabaseAdmin().from('transactions').delete().eq('user_id', res.locals.userId);
  if (error) {
    res.status(500).json({ error: MESSAGES.deleteFailed });
    return;
  }
  res.status(204).end();
});
