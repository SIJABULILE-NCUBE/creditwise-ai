begin;
select plan(10);

-- Create a user for rules testing
insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111114',
  'rules.test@example.com',
  '{"first_name": "RulesUser", "is_18_or_older": true}'::jsonb
);

-- T-BR2-2: Gross income 0 or net > gross
select throws_ok(
  $$
    update public.money_profiles
    set gross_income = 0.00, net_income = 0.00
    where user_id = '11111111-1111-1111-1111-111111111114';
  $$,
  null,
  'T-BR2-2 gross income 0.00 is refused'
);

select throws_ok(
  $$
    update public.money_profiles
    set gross_income = 10000.00, net_income = 12000.00
    where user_id = '11111111-1111-1111-1111-111111111114';
  $$,
  null,
  'T-BR2-2 net income higher than gross is refused'
);

-- T-BR3-3: Debt name length or unknown type
select throws_ok(
  $$
    insert into public.debts (id, user_id, name, type, monthly_repayment)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111114', 'A', 'Personal loan', 100.00);
  $$,
  null,
  'T-BR3-3 debt name of 1 character is refused'
);

select throws_ok(
  $$
    insert into public.debts (id, user_id, name, type, monthly_repayment)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111114', 'Valid Name', 'Invalid Type', 100.00);
  $$,
  null,
  'T-BR3-3 unknown debt type is refused'
);

-- T-BR3-2: 16th debt raises limit_debts
do $$
begin
  for i in 1..15 loop
    insert into public.debts (id, user_id, name, type, monthly_repayment)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111114', 'Debt ' || i, 'Personal loan', 100.00);
  end loop;
end $$;

select throws_ok(
  $$
    insert into public.debts (id, user_id, name, type, monthly_repayment)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111114', 'Debt 16', 'Personal loan', 100.00);
  $$,
  'limit_debts',
  'T-BR3-2 16th debt raises limit_debts'
);

-- T-BR8-2: completed_at refused with no expenses
select throws_ok(
  $$
    update public.money_profiles
    set gross_income = 20000.00, net_income = 15000.00, completed_at = now()
    where user_id = '11111111-1111-1111-1111-111111111114';
  $$,
  'check_profile_complete',
  'T-BR8-2 completed_at refused when user has no expenses'
);

-- Add an expense and check completed_at allowed
insert into public.expenses (id, user_id, name, category, monthly_amount)
values (gen_random_uuid(), '11111111-1111-1111-1111-111111111114', 'Rent', 'Housing', 5000.00);

select lives_ok(
  $$
    update public.money_profiles
    set gross_income = 20000.00, net_income = 15000.00, completed_at = now()
    where user_id = '11111111-1111-1111-1111-111111111114';
  $$,
  'T-BR8-2 completed_at allowed when income, debts and expenses exist'
);

-- T-BR10-2: Transaction date check (SAST tomorrow or 91 days ago)
select throws_ok(
  $$
    insert into public.transactions (id, user_id, date, description, amount, source)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111114',
      (timezone('Africa/Johannesburg', now())::date + 1),
      'Future Tx',
      -100.00,
      'manual'
    );
  $$,
  'check_transaction_date',
  'T-BR10-2 future date is refused'
);

select throws_ok(
  $$
    insert into public.transactions (id, user_id, date, description, amount, source)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111114',
      (timezone('Africa/Johannesburg', now())::date - 91),
      'Old Tx',
      -100.00,
      'manual'
    );
  $$,
  'check_transaction_date',
  'T-BR10-2 91 days ago date is refused'
);

select lives_ok(
  $$
    insert into public.transactions (id, user_id, date, description, amount, source)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111114',
      (timezone('Africa/Johannesburg', now())::date - 90),
      'Valid 90-day Tx',
      -100.00,
      'manual'
    );
  $$,
  'T-BR10-2 90 days ago date is accepted'
);

select * from finish();
rollback;
