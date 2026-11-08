import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Creates the seed users and their data (plan 8.7). Uses the secret key; never in the app.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SEED_TEST_PASSWORD;
if (!url || !serviceKey || !password) {
  throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_TEST_PASSWORD must be set in .env');
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const THANDO = '00000000-0000-0000-0000-000000000001';
const SIBUSISO = '00000000-0000-0000-0000-000000000002';
const AYANDA = '00000000-0000-0000-0000-000000000003';
const SETUP = '00000000-0000-0000-0000-000000000004';

const BR17_REFUSAL =
  "I can't give financial advice or tell you whether a lender will approve you. I can explain how things work using your numbers. For personal advice, speak to a registered financial adviser or a debt counsellor registered with the National Credit Regulator.";
const THANDO_ANSWER =
  "Right now about R9,000.00 of your R25,000.00 income goes to debt, so your DTI is 36% (amber). Using CreditWise's bands, a new repayment of more than R1,000.00 a month would push you into the red range, where lenders are more likely to decline. If you settled your 2 store accounts first, that room would grow to about R3,500.00. Remember that a lender also looks at your credit record and its own rules, so treat this as a guide, not an approval.";

interface SeedProfile {
  id: string;
  email: string;
  firstName: string;
  gross?: number;
  net?: number;
  expenses?: [string, string, number][];
  debts?: [string, string, number, number | null][];
}

const people: SeedProfile[] = [
  {
    id: THANDO,
    email: 'thando.nkosi@example.com',
    firstName: 'Thando',
    gross: 25000,
    net: 19800,
    expenses: [
      ['Rent', 'Housing', 4800],
      ['Transport', 'Transport', 1500],
      ['Groceries', 'Food', 2000],
      ['Cellphone contract', 'Phone and internet', 399],
      ['Gym', 'Other', 399],
    ],
    debts: [
      ['Personal loan', 'Personal loan', 4500, 68000],
      ['Credit card', 'Credit card', 2000, 18000],
      ['Furniture store account', 'Store account', 1300, 14500],
      ['Clothing store card', 'Store account', 1200, 6400],
    ],
  },
  {
    id: SIBUSISO,
    email: 'sibusiso.ndlovu@example.com',
    firstName: 'Sibusiso',
    gross: 32000,
    net: 24500,
    expenses: [
      ['Rent', 'Housing', 5500],
      ['Groceries', 'Food', 3500],
      ['Transport', 'Transport', 2200],
      ['School fees', 'Education', 2000],
    ],
    debts: [
      ['Vehicle finance', 'Vehicle finance', 5900, 182000],
      ['Personal loan', 'Personal loan', 3800, 41000],
      ['Credit card', 'Credit card', 2100, 22500],
      ['Store account A', 'Store account', 900, null],
      ['Store account B', 'Store account', 850, null],
      ['Store account C', 'Store account', 850, null],
    ],
  },
  {
    id: AYANDA,
    email: 'ayanda.mthembu@example.com',
    firstName: 'Ayanda',
    gross: 14000,
    net: 11900,
    expenses: [
      ['Rent', 'Housing', 4500],
      ['Groceries', 'Food', 2000],
      ['Transport', 'Transport', 1200],
      ['Family support', 'Family support', 500],
    ],
    debts: [],
  },
  { id: SETUP, email: 'setup.user@example.com', firstName: 'Setup' },
];

function must<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

function yesterdaySast(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
  const today = new Date(`${parts}T00:00:00Z`);
  return new Date(today.getTime() - 86_400_000);
}

async function loadTransactions(userId: string, file: string) {
  const rows = readFileSync(file, 'utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, description, amount] = line.split(',');
      return { date: new Date(`${date}T00:00:00Z`), description, amount: Number(amount) };
    });
  const newest = Math.max(...rows.map((r) => r.date.getTime()));
  const shift = yesterdaySast().getTime() - newest;
  const start = Date.now();
  must(
    await admin.from('transactions').insert(
      rows.map((r, i) => ({
        user_id: userId,
        date: new Date(r.date.getTime() + shift).toISOString().slice(0, 10),
        description: r.description,
        amount: r.amount,
        source: 'csv',
        created_at: new Date(start + i).toISOString(),
      })),
    ),
    'insert transactions',
  );
  must(await admin.rpc('recalculate_flags', { p_user_id: userId }), 'recalculate_flags');
}

async function seedPerson(p: SeedProfile) {
  await admin.auth.admin.deleteUser(p.id);
  must(
    await admin.auth.admin.createUser({
      id: p.id,
      email: p.email,
      password,
      email_confirm: true,
      user_metadata: { first_name: p.firstName, is_18_or_older: true },
    }),
    `create ${p.firstName}`,
  );
  if (p.gross === undefined) return;

  must(await admin.from('money_profiles').update({ gross_income: p.gross, net_income: p.net, setup_step: 3 }).eq('user_id', p.id), 'income');
  must(
    await admin.from('expenses').insert(p.expenses!.map(([name, category, monthly_amount]) => ({ user_id: p.id, name, category, monthly_amount }))),
    'expenses',
  );
  if (p.debts!.length > 0) {
    must(
      await admin.from('debts').insert(p.debts!.map(([name, type, monthly_repayment, balance_owing]) => ({ user_id: p.id, name, type, monthly_repayment, balance_owing }))),
      'debts',
    );
  }
  must(
    await admin.from('money_profiles').update({ has_no_debts: p.debts!.length === 0, completed_at: new Date().toISOString() }).eq('user_id', p.id),
    'complete profile',
  );
}

async function addChat(userId: string, question: string, answer: string) {
  const start = Date.now();
  must(
    await admin.from('chat_messages').insert([
      { user_id: userId, role: 'user', text: question, created_at: new Date(start).toISOString() },
      { user_id: userId, role: 'assistant', text: answer, created_at: new Date(start + 1000).toISOString() },
    ]),
    'chat',
  );
}

async function main() {
  for (const person of people) await seedPerson(person);

  await loadTransactions(THANDO, 'tests/fixtures/thando-oct.csv');
  await loadTransactions(SIBUSISO, 'tests/fixtures/sibusiso.csv');
  must(
    await admin.from('transactions').update({ flag_status: 'querying' }).eq('user_id', SIBUSISO).eq('description', 'FAMILYCARE FUNERAL PLAN').eq('flag_type', 'double_charge'),
    'querying flag',
  );

  await addChat(THANDO, 'What car instalment can I afford?', THANDO_ANSWER);
  await addChat(SIBUSISO, 'Which bank will approve me?', BR17_REFUSAL);

  const guide = must(await admin.from('guides').select('id').eq('slug', 'vehicle-finance').single(), 'guide');
  const items = must(
    await admin.from('checklist_items').select('id').eq('guide_id', guide.id).order('sort_order').limit(2),
    'checklist items',
  );
  must(await admin.from('checklist_ticks').insert(items.map((item) => ({ user_id: THANDO, item_id: item.id }))), 'ticks');

  console.log('Seed data loaded.');
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
