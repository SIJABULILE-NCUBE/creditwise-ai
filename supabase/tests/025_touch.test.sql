begin;
select plan(6);

insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111121', 'touch.test@example.com', '{"first_name": "Touch", "is_18_or_older": true}'::jsonb);

create function pg_temp.backdate() returns void language plpgsql as $fn$
begin
  alter table public.money_profiles disable trigger touch_money_profile_on_update;
  update public.money_profiles set updated_at = '2000-01-01' where user_id = '11111111-1111-1111-1111-111111111121';
  alter table public.money_profiles enable trigger touch_money_profile_on_update;
end $fn$;
create function pg_temp.touched() returns boolean language sql as $fn$
  select updated_at = now() from public.money_profiles where user_id = '11111111-1111-1111-1111-111111111121'
$fn$;

select pg_temp.backdate();
insert into public.debts (id, user_id, name, type, monthly_repayment)
values ('12121212-1212-1212-1212-121212121211', '11111111-1111-1111-1111-111111111121', 'Loan', 'Other', 100);
select ok(pg_temp.touched(), 'T-DB-2 adding a debt sets updated_at');

select pg_temp.backdate();
update public.debts set monthly_repayment = 200 where id = '12121212-1212-1212-1212-121212121211';
select ok(pg_temp.touched(), 'T-DB-2 editing a debt sets updated_at');

select pg_temp.backdate();
delete from public.debts where id = '12121212-1212-1212-1212-121212121211';
select ok(pg_temp.touched(), 'T-DB-2 deleting a debt sets updated_at');

select pg_temp.backdate();
insert into public.expenses (id, user_id, name, category, monthly_amount)
values ('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111121', 'Rent', 'Housing', 100);
select ok(pg_temp.touched(), 'T-DB-2 adding an expense sets updated_at');

select pg_temp.backdate();
delete from public.expenses where id = '12121212-1212-1212-1212-121212121212';
select ok(pg_temp.touched(), 'T-DB-2 deleting an expense sets updated_at');

select pg_temp.backdate();
update public.money_profiles set gross_income = 1000, net_income = 900 where user_id = '11111111-1111-1111-1111-111111111121';
select ok(pg_temp.touched(), 'T-DB-2 updating income sets updated_at');

select * from finish();
rollback;
