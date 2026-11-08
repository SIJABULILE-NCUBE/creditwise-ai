begin;
select plan(8);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111116',
  'flags.test@example.com',
  '{"first_name": "FlagsUser", "is_18_or_older": true}'::jsonb
);

-- T-BR11-1: Double charge 1 Oct & 2 Oct
-- We'll set transactions relative to today SAST
-- Earliest transaction 60 days ago
insert into public.transactions (id, user_id, date, description, amount, source)
values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111116',
  (timezone('Africa/Johannesburg', now())::date - 60),
  'Opening tx',
  -50.00,
  'manual'
);

-- 1 Sep (-40d), 1 Oct (-10d), 2 Oct (-9d)
insert into public.transactions (id, user_id, date, description, amount, source)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 40), 'FITZONE GYM DEBIT', -399.00, 'csv'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 10), 'FITZONE GYM DEBIT', -399.00, 'csv'),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 9), 'FITZONE GYM DEBIT', -399.00, 'csv');

select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_type from public.transactions where id = '44444444-4444-4444-4444-444444444443'),
  'double_charge',
  'T-BR11-1 2 Oct gym payment is flagged double_charge'
);

select is(
  (select flag_type from public.transactions where id = '44444444-4444-4444-4444-444444444441'),
  'none',
  'T-BR11-1 1 Sep gym payment is not flagged'
);

-- T-BR11-2: Compare description ignore case, digits, repeated spaces
insert into public.transactions (id, user_id, date, description, amount, source)
values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 5), 'FITZONE GYM 0012', -200.00, 'csv'),
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 5), 'fitzone  gym 0013', -200.00, 'csv');

select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_type from public.transactions where id = '44444444-4444-4444-4444-444444444445'),
  'double_charge',
  'T-BR11-2 normalized descriptions match and flag equal date second tx'
);

-- T-BR12-1: Higher than usual
insert into public.transactions (id, user_id, date, description, amount, source)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 50), 'PREPAID ELECTRICITY', -350.00, 'csv'),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 25), 'PREPAID ELECTRICITY', -380.00, 'csv'),
  ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 2), 'PREPAID ELECTRICITY', -1150.00, 'csv');

select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_type from public.transactions where id = '55555555-5555-5555-5555-555555555553'),
  'higher_than_usual',
  'T-BR12-1 electricity payment 1150 is flagged higher_than_usual'
);

-- T-BR13-1: New payee >= 1000 and >= 30 days after earliest
insert into public.transactions (id, user_id, date, description, amount, source)
values
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 1), 'ONLINE TECH STORE', -2499.00, 'csv');

select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_type from public.transactions where id = '66666666-6666-6666-6666-666666666661'),
  'new_payee',
  'T-BR13-1 online tech store is flagged new_payee'
);

-- T-BR14-1: Money in is never flagged
insert into public.transactions (id, user_id, date, description, amount, source)
values
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111116', (timezone('Africa/Johannesburg', now())::date - 1), 'SALARY DEPOSIT', 19800.00, 'csv');

select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_type from public.transactions where id = '77777777-7777-7777-7777-777777777771'),
  'none',
  'T-BR14-1 money-in is never flagged'
);

-- T-BR14-2: Recalculating keeps status if still qualifies
update public.transactions set flag_status = 'querying' where id = '66666666-6666-6666-6666-666666666661';
select public.recalculate_flags('11111111-1111-1111-1111-111111111116');

select is(
  (select flag_status from public.transactions where id = '66666666-6666-6666-6666-666666666661'),
  'querying',
  'T-BR14-2 recalculating preserves querying status'
);

select * from finish();
rollback;
