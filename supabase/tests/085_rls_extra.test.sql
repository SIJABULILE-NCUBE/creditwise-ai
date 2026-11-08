begin;
select plan(21);

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);

select throws_ok($$ select is_18_or_older from public.users where id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-1b a column outside the allowed list cannot be read');
select throws_ok($$ delete from public.users where id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-2b authenticated cannot delete a users row');

select lives_ok($$ update public.money_profiles set gross_income = 26000 where user_id = '00000000-0000-0000-0000-000000000001' $$, 'T-SEC-4a owner can update income');
select throws_ok($$ update public.money_profiles set user_id = '00000000-0000-0000-0000-000000000002' where user_id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-4b user_id cannot be changed');
select throws_ok($$ update public.money_profiles set created_at = now() where user_id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-4b created_at cannot be changed');
select throws_ok($$ delete from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-5b authenticated cannot delete money_profiles');

select lives_ok($$ insert into public.debts (name, type, monthly_repayment) values ('New debt', 'Other', 100) $$, 'T-SEC-6a owner can add a debt (user_id defaults to the caller)');
select lives_ok($$ insert into public.expenses (name, category, monthly_amount) values ('New expense', 'Other', 100) $$, 'T-SEC-7a owner can add an expense');
select throws_ok($$ delete from public.transactions where user_id = '00000000-0000-0000-0000-000000000001' $$, '42501', null, 'T-SEC-9b authenticated cannot delete transactions directly');
select lives_ok($$ insert into public.checklist_ticks (item_id) select id from public.checklist_items where sort_order = 5 limit 1 $$, 'T-SEC-14a owner can tick an item');
select throws_ok($$ update public.checklist_ticks set created_at = now() $$, '42501', null, 'T-SEC-14b ticks cannot be updated');
select throws_ok($$ update public.guides set title = 'Hacked' $$, '42501', null, 'T-SEC-13b guides cannot be changed from the browser');

-- Writes aimed at another user are filtered by RLS; the results are checked below as the database owner.
update public.money_profiles set gross_income = 1 where user_id = '00000000-0000-0000-0000-000000000002';
update public.debts set monthly_repayment = 1 where user_id = '00000000-0000-0000-0000-000000000002';
delete from public.expenses where user_id = '00000000-0000-0000-0000-000000000002';
update public.transactions set flag_status = 'resolved' where user_id = '00000000-0000-0000-0000-000000000002';
delete from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000002';

-- The owner's own writes.
delete from public.debts where name = 'New debt';
update public.transactions set flag_status = 'dismissed' where user_id = '00000000-0000-0000-0000-000000000001' and flag_type = 'double_charge';
delete from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000001';

reset role;

select is((select gross_income from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000002'), 32000.00::numeric, 'T-SEC-4b another user''s profile is not updated');
select is((select count(*) from public.debts where user_id = '00000000-0000-0000-0000-000000000002' and monthly_repayment = 1), 0::bigint, 'T-SEC-6b another user''s debt is not updated');
select is((select count(*) from public.expenses where user_id = '00000000-0000-0000-0000-000000000002'), 4::bigint, 'T-SEC-7b another user''s expenses are not deleted');
select is((select flag_status from public.transactions where user_id = '00000000-0000-0000-0000-000000000002' and flag_type <> 'none'), 'querying', 'T-SEC-10b another user''s flag status is unchanged');
select is((select count(*) from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000002'), 2::bigint, 'T-SEC-11b another user''s messages are not deleted');
select is((select count(*) from public.debts where name = 'New debt'), 0::bigint, 'T-SEC-6a owner can delete a debt');
select is((select flag_status from public.transactions where user_id = '00000000-0000-0000-0000-000000000001' and flag_type = 'double_charge'), 'dismissed', 'T-SEC-10a owner can change their own flag status');
select is((select count(*) from public.chat_messages where user_id = '00000000-0000-0000-0000-000000000001'), 0::bigint, 'T-SEC-11a owner can delete their own messages');
select is((select count(*) from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000001' and gross_income = 26000), 1::bigint, 'T-SEC-4a the owner''s income update was saved');

select * from finish();
rollback;
