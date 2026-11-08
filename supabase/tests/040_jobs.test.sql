begin;
select plan(4);

-- Setup test user
insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111115',
  'jobs.test@example.com',
  '{"first_name": "JobsUser", "is_18_or_older": true}'::jsonb
);

-- Insert 90-day-old transaction
insert into public.transactions (id, user_id, date, description, amount, source)
values (
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111115',
  (timezone('Africa/Johannesburg', now())::date - 90),
  'Kept 90d Tx',
  -100.00,
  'manual'
);

-- Force insert a 91-day old transaction by bypassing or inserting before trigger, or disabling trigger temporarily in test
-- Actually, we can update transaction date directly if update trigger allows or insert
alter table public.transactions disable trigger check_transaction_date;
insert into public.transactions (id, user_id, date, description, amount, source)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111115',
  (timezone('Africa/Johannesburg', now())::date - 91),
  'Old 91d Tx',
  -100.00,
  'manual'
);
alter table public.transactions enable trigger check_transaction_date;

-- Insert chat messages: 29 days old and 31 days old
insert into public.chat_messages (id, user_id, role, text, created_at)
values (
  '33333333-3333-3333-3333-333333333331',
  '11111111-1111-1111-1111-111111111115',
  'user',
  'Recent question',
  now() - interval '29 days'
);

insert into public.chat_messages (id, user_id, role, text, created_at)
values (
  '33333333-3333-3333-3333-333333333332',
  '11111111-1111-1111-1111-111111111115',
  'user',
  'Old question',
  now() - interval '31 days'
);

-- Run cleanup_old_data()
select lives_ok(
  $$ select public.cleanup_old_data(); $$,
  'cleanup_old_data executes without error'
);

-- Check T-BR10-4
select is(
  (select count(*) from public.transactions where id = '22222222-2222-2222-2222-222222222221'),
  1::bigint,
  'T-BR10-4 transaction 90 days ago is kept'
);

select is(
  (select count(*) from public.transactions where id = '22222222-2222-2222-2222-222222222222'),
  0::bigint,
  'T-BR10-4 transaction 91 days ago is deleted'
);

-- Check T-BR15-3
select is(
  (select count(*) from public.chat_messages where id = '33333333-3333-3333-3333-333333333332'),
  0::bigint,
  'T-BR15-3 chat message older than 30 days is deleted'
);

select * from finish();
rollback;
