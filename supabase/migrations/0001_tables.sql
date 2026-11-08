-- 0001_tables.sql: Tables, constraints, and indexes

-- 1. users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  first_name text not null check (
    char_length(first_name) between 2 and 40
    and first_name ~ '^[A-Za-zÀ-ÿ'' -]+$'
  ),
  is_18_or_older boolean not null default false check (is_18_or_older = true),
  privacy_accepted_at timestamptz not null default now(),
  ask_count integer not null default 0 check (ask_count between 0 and 20),
  ask_count_date date null,
  created_at timestamptz not null default now()
);

-- 2. money_profiles
create table public.money_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  gross_income numeric(12,2) null check (gross_income between 1 and 10000000),
  net_income numeric(12,2) null check (net_income >= 1 and net_income <= gross_income),
  has_no_debts boolean not null default false,
  setup_step integer not null default 1 check (setup_step between 1 and 3),
  completed_at timestamptz null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 3. debts
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 40),
  type text not null check (
    type in ('Personal loan', 'Vehicle finance', 'Home loan', 'Credit card', 'Store account', 'Student loan', 'Other')
  ),
  monthly_repayment numeric(12,2) not null check (monthly_repayment between 1 and 1000000),
  balance_owing numeric(12,2) null check (balance_owing between 0 and 10000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 40),
  category text not null check (
    category in ('Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Education', 'Phone and internet', 'Family support', 'Other')
  ),
  monthly_amount numeric(12,2) not null check (monthly_amount between 1 and 1000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  description text not null check (char_length(description) between 1 and 80),
  amount numeric(12,2) not null check (amount <> 0 and abs(amount) <= 1000000),
  source text not null check (source in ('csv', 'manual')),
  flag_type text not null default 'none' check (
    flag_type in ('none', 'double_charge', 'higher_than_usual', 'new_payee')
  ),
  flag_status text not null default 'none' check (
    flag_status in ('none', 'open', 'dismissed', 'querying', 'resolved')
  ),
  flag_status_changed_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint check_flag_sync check ((flag_type = 'none') = (flag_status = 'none'))
);

-- 6. chat_messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  text text not null check (
    char_length(text) between 1 and 2000
    and (role <> 'user' or char_length(text) <= 500)
  ),
  created_at timestamptz not null default now()
);

-- 7. guides
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('vehicle-finance', 'personal-loans', 'credit-cards')),
  title text not null check (char_length(title) between 1 and 40),
  summary text not null check (char_length(summary) between 1 and 80),
  icon text not null check (icon in ('car', 'hand-coins', 'credit-card')),
  body text not null check (char_length(body) <= 6000),
  sort_order integer not null check (sort_order between 1 and 3),
  created_at timestamptz not null default now()
);

-- 8. checklist_items
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete restrict,
  text text not null check (
    char_length(text) between 1 and 80
    and (text like 'I have %' or text like 'I''ve %' or text like 'My %')
  ),
  sort_order integer not null check (sort_order between 1 and 8),
  created_at timestamptz not null default now(),
  unique (guide_id, sort_order)
);

-- 9. checklist_ticks
create table public.checklist_ticks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users(id) on delete cascade,
  item_id uuid not null references public.checklist_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

-- Indexes (Section 8.4)
create index idx_debts_user_id on public.debts (user_id);
create index idx_expenses_user_id on public.expenses (user_id);
create index idx_transactions_user_date_created on public.transactions (user_id, date desc, created_at desc);
create index idx_transactions_user_flag_status on public.transactions (user_id, flag_status);
create index idx_transactions_date on public.transactions (date);
create index idx_chat_messages_user_created on public.chat_messages (user_id, created_at);
create index idx_chat_messages_created on public.chat_messages (created_at);
create index idx_checklist_items_guide_sort on public.checklist_items (guide_id, sort_order);
create index idx_checklist_ticks_user on public.checklist_ticks (user_id);
