begin;
select plan(20);

-- T-DB-1: Tables exist
select has_table('public', 'users', 'T-DB-1 users table exists');
select has_table('public', 'money_profiles', 'T-DB-1 money_profiles table exists');
select has_table('public', 'debts', 'T-DB-1 debts table exists');
select has_table('public', 'expenses', 'T-DB-1 expenses table exists');
select has_table('public', 'transactions', 'T-DB-1 transactions table exists');
select has_table('public', 'chat_messages', 'T-DB-1 chat_messages table exists');
select has_table('public', 'guides', 'T-DB-1 guides table exists');
select has_table('public', 'checklist_items', 'T-DB-1 checklist_items table exists');
select has_table('public', 'checklist_ticks', 'T-DB-1 checklist_ticks table exists');

-- Columns exist on users
select has_column('public', 'users', 'id', 'users.id exists');
select has_column('public', 'users', 'email', 'users.email exists');
select has_column('public', 'users', 'first_name', 'users.first_name exists');
select has_column('public', 'users', 'is_18_or_older', 'users.is_18_or_older exists');
select has_column('public', 'users', 'ask_count', 'users.ask_count exists');

-- Columns on money_profiles
select has_column('public', 'money_profiles', 'gross_income', 'money_profiles.gross_income exists');
select has_column('public', 'money_profiles', 'net_income', 'money_profiles.net_income exists');
select has_column('public', 'money_profiles', 'has_no_debts', 'money_profiles.has_no_debts exists');
select has_column('public', 'money_profiles', 'setup_step', 'money_profiles.setup_step exists');
select has_column('public', 'money_profiles', 'completed_at', 'money_profiles.completed_at exists');

-- Trigger handle_new_user test
-- Creating an Auth user creates a users row and a money_profiles row
insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  'test.trigger@example.com',
  '{"first_name": "TestUser", "is_18_or_older": true}'::jsonb
);

select is(
  (select first_name from public.users where id = '11111111-1111-1111-1111-111111111111'),
  'TestUser',
  'T-DB-1 handle_new_user creates users row with first_name'
);

select * from finish();
rollback;
