-- 0003_rls.sql: Row Level Security and column permissions

-- Grant schema usage
grant usage on schema public to anon, authenticated;

-- Enable RLS on all 9 public tables
alter table public.users enable row level security;
alter table public.money_profiles enable row level security;
alter table public.debts enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.guides enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_ticks enable row level security;

-- 1. users: SEC1, SEC2
revoke all on public.users from authenticated, anon;
grant select (id, email, first_name, ask_count, ask_count_date, created_at) on public.users to authenticated;

create policy users_select_owner on public.users
  for select to authenticated
  using (id = auth.uid());

-- 2. money_profiles: SEC4, SEC5
revoke all on public.money_profiles from authenticated, anon;
grant select on public.money_profiles to authenticated;
grant update (gross_income, net_income, has_no_debts, setup_step, completed_at) on public.money_profiles to authenticated;

create policy money_profiles_select_owner on public.money_profiles
  for select to authenticated
  using (user_id = auth.uid());

create policy money_profiles_update_owner on public.money_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 3. debts: SEC6
revoke all on public.debts from authenticated, anon;
grant select, insert, update, delete on public.debts to authenticated;

create policy debts_select_owner on public.debts
  for select to authenticated
  using (user_id = auth.uid());

create policy debts_insert_owner on public.debts
  for insert to authenticated
  with check (user_id = auth.uid());

create policy debts_update_owner on public.debts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy debts_delete_owner on public.debts
  for delete to authenticated
  using (user_id = auth.uid());

-- 4. expenses: SEC7
revoke all on public.expenses from authenticated, anon;
grant select, insert, update, delete on public.expenses to authenticated;

create policy expenses_select_owner on public.expenses
  for select to authenticated
  using (user_id = auth.uid());

create policy expenses_insert_owner on public.expenses
  for insert to authenticated
  with check (user_id = auth.uid());

create policy expenses_update_owner on public.expenses
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy expenses_delete_owner on public.expenses
  for delete to authenticated
  using (user_id = auth.uid());

-- 5. transactions: SEC8, SEC9, SEC10
revoke all on public.transactions from authenticated, anon;
grant select on public.transactions to authenticated;
grant update (flag_status) on public.transactions to authenticated;

create policy transactions_select_owner on public.transactions
  for select to authenticated
  using (user_id = auth.uid());

create policy transactions_update_owner on public.transactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 6. chat_messages: SEC11, SEC12
revoke all on public.chat_messages from authenticated, anon;
grant select, delete on public.chat_messages to authenticated;

create policy chat_messages_select_owner on public.chat_messages
  for select to authenticated
  using (user_id = auth.uid());

create policy chat_messages_delete_owner on public.chat_messages
  for delete to authenticated
  using (user_id = auth.uid());

-- 7. guides: SEC13
-- anon holds the table grant but no policy, so RLS returns no rows to logged-out visitors
revoke all on public.guides from authenticated, anon;
grant select on public.guides to authenticated, anon;

create policy guides_select_authenticated on public.guides
  for select to authenticated
  using (true);

-- 8. checklist_items: SEC13
revoke all on public.checklist_items from authenticated, anon;
grant select on public.checklist_items to authenticated, anon;

create policy checklist_items_select_authenticated on public.checklist_items
  for select to authenticated
  using (true);

-- 9. checklist_ticks: SEC14
revoke all on public.checklist_ticks from authenticated, anon;
grant select, insert, delete on public.checklist_ticks to authenticated;

create policy checklist_ticks_select_owner on public.checklist_ticks
  for select to authenticated
  using (user_id = auth.uid());

create policy checklist_ticks_insert_owner on public.checklist_ticks
  for insert to authenticated
  with check (user_id = auth.uid());

create policy checklist_ticks_delete_owner on public.checklist_ticks
  for delete to authenticated
  using (user_id = auth.uid());
