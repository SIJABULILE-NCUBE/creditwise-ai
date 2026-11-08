begin;
select plan(6);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111117',
  'status.test@example.com',
  '{"first_name": "StatusUser", "is_18_or_older": true}'::jsonb
);

insert into public.transactions (id, user_id, date, description, amount, source, flag_type, flag_status)
values (
  '88888888-8888-8888-8888-888888888881',
  '11111111-1111-1111-1111-111111111117',
  (timezone('Africa/Johannesburg', now())::date - 1),
  'Flagged item',
  -500.00,
  'manual',
  'double_charge',
  'open'
);

-- Act as authenticated owner
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111117', 'role', 'authenticated')::text, true);

-- 1. open -> dismissed allowed
select lives_ok(
  $$ update public.transactions set flag_status = 'dismissed' where id = '88888888-8888-8888-8888-888888888881' $$,
  'T-BR14-3 open -> dismissed allowed'
);

-- 2. dismissed -> open allowed
select lives_ok(
  $$ update public.transactions set flag_status = 'open' where id = '88888888-8888-8888-8888-888888888881' $$,
  'T-BR14-3 dismissed -> open allowed'
);

-- 3. open -> querying allowed
select lives_ok(
  $$ update public.transactions set flag_status = 'querying' where id = '88888888-8888-8888-8888-888888888881' $$,
  'T-BR14-3 open -> querying allowed'
);

-- 4. querying -> resolved allowed
select lives_ok(
  $$ update public.transactions set flag_status = 'resolved' where id = '88888888-8888-8888-8888-888888888881' $$,
  'T-BR14-3 querying -> resolved allowed'
);

-- Reset back to postgres to reset flag_status to open
set local role postgres;
update public.transactions set flag_status = 'open' where id = '88888888-8888-8888-8888-888888888881';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111117', 'role', 'authenticated')::text, true);

-- 5. open -> resolved refused
select throws_ok(
  $$ update public.transactions set flag_status = 'resolved' where id = '88888888-8888-8888-8888-888888888881' $$,
  null,
  'T-BR14-3 open -> resolved is refused'
);

-- 6. Changing description is refused
select throws_ok(
  $$ update public.transactions set description = 'Hacked' where id = '88888888-8888-8888-8888-888888888881' $$,
  null,
  'T-BR14-3 authenticated role cannot change description'
);

select * from finish();
rollback;
