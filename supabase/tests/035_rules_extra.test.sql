begin;
select plan(14);

insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111131', 'rules2.test@example.com', '{"first_name": "RulesTwo", "is_18_or_older": true}'::jsonb),
 ('11111111-1111-1111-1111-111111111132', 'rules3.test@example.com', '{"first_name": "RulesThree", "is_18_or_older": true}'::jsonb);

select throws_ok($$ update public.money_profiles set gross_income = 10000000.01, net_income = 1 where user_id = '11111111-1111-1111-1111-111111111131' $$, null, 'T-BR2-2 gross income R10,000,000.01 is refused');

select throws_ok($$ insert into public.debts (user_id, name, type, monthly_repayment) values ('11111111-1111-1111-1111-111111111131', repeat('a', 41), 'Other', 100) $$, null, 'T-BR3-3 debt name of 41 characters is refused');
select throws_ok($$ insert into public.debts (user_id, name, type, monthly_repayment) values ('11111111-1111-1111-1111-111111111131', 'Valid', 'Other', 0) $$, null, 'T-BR3-3 repayment R0.00 is refused');
select throws_ok($$ insert into public.debts (user_id, name, type, monthly_repayment) values ('11111111-1111-1111-1111-111111111131', 'Valid', 'Other', 1000000.01) $$, null, 'T-BR3-3 repayment R1,000,000.01 is refused');
select throws_ok($$ insert into public.expenses (user_id, name, category, monthly_amount) values ('11111111-1111-1111-1111-111111111131', 'Valid', 'Nonsense', 100) $$, null, 'T-BR3-3 unknown category is refused');

do $do$ begin
  for i in 1..20 loop
    insert into public.expenses (user_id, name, category, monthly_amount) values ('11111111-1111-1111-1111-111111111131', 'Expense ' || i, 'Other', 10);
  end loop;
end $do$;
select throws_ok($$ insert into public.expenses (user_id, name, category, monthly_amount) values ('11111111-1111-1111-1111-111111111131', 'Expense 21', 'Other', 10) $$, 'limit_expenses', 'T-BR3-2 21st expense raises limit_expenses');

select throws_ok($$ update public.money_profiles set completed_at = now() where user_id = '11111111-1111-1111-1111-111111111131' $$, 'check_profile_complete', 'T-BR8-2 completed_at refused with no income');

update public.money_profiles set gross_income = 1000, net_income = 900 where user_id = '11111111-1111-1111-1111-111111111131';
select throws_ok($$ update public.money_profiles set completed_at = now() where user_id = '11111111-1111-1111-1111-111111111131' $$, 'check_profile_complete', 'T-BR8-2 completed_at refused with no debt and has_no_debts false');

update public.money_profiles set has_no_debts = true where user_id = '11111111-1111-1111-1111-111111111131';
select lives_ok($$ update public.money_profiles set completed_at = now() where user_id = '11111111-1111-1111-1111-111111111131' $$, 'T-BR8-2 completed_at allowed with has_no_debts true');

select lives_ok($$ insert into public.transactions (user_id, date, description, amount, source) values ('11111111-1111-1111-1111-111111111132', timezone('Africa/Johannesburg', now())::date, 'Today', -1, 'manual') $$, 'T-BR10-2 today is accepted');

insert into public.transactions (user_id, date, description, amount, source)
select '11111111-1111-1111-1111-111111111132', timezone('Africa/Johannesburg', now())::date, 'Row ' || g, -1, 'csv' from generate_series(1, 999) g;
select is((select count(*) from public.transactions where user_id = '11111111-1111-1111-1111-111111111132'), 1000::bigint, 'T-BR10-3 1,000 transactions are stored');
select throws_ok($$ insert into public.transactions (user_id, date, description, amount, source) values ('11111111-1111-1111-1111-111111111132', timezone('Africa/Johannesburg', now())::date, 'Too many', -1, 'manual') $$, 'limit_transactions', 'T-BR10-3 1,001st transaction raises limit_transactions');

select throws_ok($$ insert into auth.users (id, email, raw_user_meta_data) values ('11111111-1111-1111-1111-111111111133', 'noage@example.com', '{"first_name": "NoAge"}'::jsonb) $$, null, 'Section 5: sign-up without the 18-or-older confirmation is refused');

set local role authenticated;
select throws_ok($$ select public.cleanup_old_data() $$, null, 'cleanup_old_data cannot be called from the browser');

select * from finish();
rollback;
