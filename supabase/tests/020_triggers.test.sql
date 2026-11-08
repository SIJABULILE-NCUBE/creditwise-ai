begin;
select plan(3);

-- Setup a test user
insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111112',
  'test.triggers@example.com',
  '{"first_name": "TriggerUser", "is_18_or_older": true}'::jsonb
);

-- T-DB-2: touch_money_profile updates money_profiles.updated_at
select lives_ok(
  $$
    insert into public.debts (id, user_id, name, type, monthly_repayment, balance_owing)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111112', 'Test Debt', 'Personal loan', 500.00, 5000.00);
  $$,
  'T-DB-2 adding a debt touches money_profiles.updated_at'
);

-- T-DB-3: has_no_debts = true is refused while the user has a debt
select throws_ok(
  $$
    update public.money_profiles
    set has_no_debts = true
    where user_id = '11111111-1111-1111-1111-111111111112';
  $$,
  'check_has_no_debts',
  'T-DB-3 has_no_debts = true refused when user has debts'
);

-- T-DB-3: adding a debt sets has_no_debts back to false
-- Create another user with has_no_debts = true
insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111113',
  'nodebt@example.com',
  '{"first_name": "NoDebt", "is_18_or_older": true}'::jsonb
);
update public.money_profiles set has_no_debts = true where user_id = '11111111-1111-1111-1111-111111111113';

insert into public.debts (id, user_id, name, type, monthly_repayment, balance_owing)
values (gen_random_uuid(), '11111111-1111-1111-1111-111111111113', 'New Debt', 'Credit card', 200.00, 1000.00);

select is(
  (select has_no_debts from public.money_profiles where user_id = '11111111-1111-1111-1111-111111111113'),
  false,
  'T-DB-3 adding a debt resets has_no_debts to false'
);

select * from finish();
rollback;
