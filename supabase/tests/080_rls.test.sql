begin;
select plan(24);

-- Users:
-- Thando = 00000000-0000-0000-0000-000000000001
-- Sibusiso = 00000000-0000-0000-0000-000000000002

-- T-SEC-1a: Thando can read own users row
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);

select is(
  (select count(*) from public.users where id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'T-SEC-1a Thando can read own users row'
);

-- T-SEC-1b: Thando cannot read Sibusiso users row
select is(
  (select count(*) from public.users where id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'T-SEC-1b Thando cannot read Sibusiso users row'
);

-- T-SEC-2b: Thando cannot update users row
select throws_ok(
  $$ update public.users set first_name = 'Changed' where id = '00000000-0000-0000-0000-000000000001' $$,
  null,
  'T-SEC-2b authenticated cannot update users row'
);

-- T-SEC-4a: Thando can read own money_profile
select is(
  (select count(*) from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'T-SEC-4a Thando can read own money_profile'
);

-- T-SEC-4b: Thando cannot read Sibusiso money_profile
select is(
  (select count(*) from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'T-SEC-4b Thando cannot read Sibusiso money_profile'
);

-- T-SEC-5b: Thando cannot insert money_profiles
select throws_ok(
  $$ insert into public.money_profiles (id, user_id) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000001') $$,
  null,
  'T-SEC-5b authenticated cannot insert money_profiles'
);

-- T-SEC-6a: Thando can read own debts
select is(
  (select count(*) from public.debts where user_id = '00000000-0000-0000-0000-000000000001'),
  (select count(*) from public.debts),
  'T-SEC-6a Thando sees only own debts'
);

-- T-SEC-6b: Thando cannot read or insert debts for Sibusiso
select throws_ok(
  $$ insert into public.debts (id, user_id, name, type, monthly_repayment) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Hacked', 'Personal loan', 100.00) $$,
  null,
  'T-SEC-6b Thando cannot insert debt for Sibusiso'
);

-- T-SEC-7a: Thando can read own expenses
select is(
  (select count(*) from public.expenses where user_id = '00000000-0000-0000-0000-000000000001'),
  (select count(*) from public.expenses),
  'T-SEC-7a Thando sees only own expenses'
);

-- T-SEC-7b: Thando cannot insert expense for Sibusiso
select throws_ok(
  $$ insert into public.expenses (id, user_id, name, category, monthly_amount) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Hacked', 'Housing', 100.00) $$,
  null,
  'T-SEC-7b Thando cannot insert expense for Sibusiso'
);

-- T-SEC-8a: Thando can read own transactions
select is(
  (select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-000000000001'),
  (select count(*) from public.transactions),
  'T-SEC-8a Thando sees only own transactions'
);

-- T-SEC-8b: Thando cannot read Sibusiso transactions
select is(
  (select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'T-SEC-8b Thando cannot read Sibusiso transactions'
);

-- T-SEC-9b: Thando cannot insert transactions directly from browser
select throws_ok(
  $$ insert into public.transactions (id, user_id, date, description, amount, source) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '2026-10-20', 'Direct', -10.00, 'manual') $$,
  null,
  'T-SEC-9b authenticated cannot insert transactions directly'
);

-- T-SEC-10b: Thando cannot update Sibusiso transactions
select throws_ok(
  $$ update public.transactions set flag_status = 'dismissed' where user_id = '00000000-0000-0000-0000-000000000002' $$,
  null,
  'T-SEC-10b Thando cannot update Sibusiso transactions'
);

-- T-SEC-11a: Thando can read own chat_messages
select is(
  (select count(*) from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000001'),
  (select count(*) from public.chat_messages),
  'T-SEC-11a Thando sees only own chat_messages'
);

-- T-SEC-11b: Thando cannot read Sibusiso chat_messages
select is(
  (select count(*) from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'T-SEC-11b Thando cannot read Sibusiso chat_messages'
);

-- T-SEC-12b: Thando cannot insert chat_messages directly from browser
select throws_ok(
  $$ insert into public.chat_messages (id, user_id, role, text) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'user', 'Hello') $$,
  null,
  'T-SEC-12b authenticated cannot insert chat_messages directly'
);

-- T-SEC-13a: Logged-in user can read guides
select is(
  (select count(*) from public.guides),
  3::bigint,
  'T-SEC-13a authenticated can read guides'
);

-- T-SEC-13b: Anonymous user cannot read guides
set local role anon;
select is(
  (select count(*) from public.guides),
  0::bigint,
  'T-SEC-13b anon cannot read guides'
);

-- Switch back to Thando
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);

-- T-SEC-14a: Thando can read own checklist_ticks
select is(
  (select count(*) from public.checklist_ticks where user_id = '00000000-0000-0000-0000-000000000001'),
  (select count(*) from public.checklist_ticks),
  'T-SEC-14a Thando sees only own checklist_ticks'
);

-- T-SEC-14b: Thando cannot read Sibusiso checklist_ticks
select is(
  (select count(*) from public.checklist_ticks where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'T-SEC-14b Thando cannot read Sibusiso checklist_ticks'
);

-- T-SEC-14c: Thando cannot insert checklist_ticks for Sibusiso
select throws_ok(
  $$ insert into public.checklist_ticks (id, user_id, item_id) values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', (select id from public.checklist_items limit 1)) $$,
  null,
  'T-SEC-14b Thando cannot insert checklist_ticks for Sibusiso'
);

-- T-SEC-13c: authenticated cannot insert guides
select throws_ok(
  $$ insert into public.guides (slug, title, summary, icon, body, sort_order) values ('new-guide', 'New', 'Summary', 'car', 'Body', 1) $$,
  null,
  'T-SEC-13c authenticated cannot insert guides'
);

-- T-SEC-13d: authenticated cannot insert checklist_items
select throws_ok(
  $$ insert into public.checklist_items (guide_id, text, sort_order) values ((select id from public.guides limit 1), 'I have a new item', 1) $$,
  null,
  'T-SEC-13d authenticated cannot insert checklist_items'
);

select * from finish();
rollback;
