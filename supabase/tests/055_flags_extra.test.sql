begin;
select plan(12);

insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111151', 'flags2.test@example.com', '{"first_name": "FlagsTwo", "is_18_or_older": true}'::jsonb);

create function pg_temp.add(p_id uuid, n int, p_desc text, p_amt numeric) returns void language sql as $fn$
  insert into public.transactions (id, user_id, date, description, amount, source)
  values (p_id, '11111111-1111-1111-1111-111111111151', timezone('Africa/Johannesburg', now())::date - n, p_desc, p_amt, 'csv')
$fn$;
create function pg_temp.flag(p_id uuid) returns text language sql as $fn$ select flag_type from public.transactions where id = p_id $fn$;

select pg_temp.add('a0000000-0000-0000-0000-000000000000', 80, 'Opening', -5);

-- BR11: 4 days apart
select pg_temp.add('a0000000-0000-0000-0000-000000000001', 40, 'GAP SHOP', -300);
select pg_temp.add('a0000000-0000-0000-0000-000000000002', 36, 'GAP SHOP', -300);
-- BR12: under R200
select pg_temp.add('a0000000-0000-0000-0000-000000000011', 70, 'SMALL', -50);
select pg_temp.add('a0000000-0000-0000-0000-000000000012', 60, 'SMALL', -50);
select pg_temp.add('a0000000-0000-0000-0000-000000000013', 50, 'SMALL', -199);
-- BR12: only 1 earlier
select pg_temp.add('a0000000-0000-0000-0000-000000000021', 70, 'ONE EARLIER', -100);
select pg_temp.add('a0000000-0000-0000-0000-000000000022', 50, 'ONE EARLIER', -900);
-- BR12: less than 2 times
select pg_temp.add('a0000000-0000-0000-0000-000000000031', 75, 'NOT DOUBLE', -300);
select pg_temp.add('a0000000-0000-0000-0000-000000000032', 65, 'NOT DOUBLE', -300);
select pg_temp.add('a0000000-0000-0000-0000-000000000033', 55, 'NOT DOUBLE', -599);
-- BR13: under R1,000 / within 30 days of the earliest
select pg_temp.add('a0000000-0000-0000-0000-000000000041', 20, 'NEW SMALL', -999.99);
select pg_temp.add('a0000000-0000-0000-0000-000000000042', 51, 'NEW EARLY', -1500);
-- BR14: both BR11 and BR12 match
select pg_temp.add('a0000000-0000-0000-0000-000000000051', 30, 'BOTH RULES', -100);
select pg_temp.add('a0000000-0000-0000-0000-000000000052', 25, 'BOTH RULES', -100);
select pg_temp.add('a0000000-0000-0000-0000-000000000053', 10, 'BOTH RULES', -1000);
select pg_temp.add('a0000000-0000-0000-0000-000000000054', 9, 'BOTH RULES', -1000);
-- BR14: equal-date money in with the same description
select pg_temp.add('a0000000-0000-0000-0000-000000000061', 5, 'REFUND', 400);
select pg_temp.add('a0000000-0000-0000-0000-000000000062', 5, 'REFUND', 400);

select public.recalculate_flags('11111111-1111-1111-1111-111111111151');

select is(pg_temp.flag('a0000000-0000-0000-0000-000000000002'), 'none', 'T-BR11-2 4 days apart is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000013'), 'none', 'T-BR12-2 under R200.00 is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000022'), 'none', 'T-BR12-2 fewer than 2 earlier payments is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000033'), 'none', 'T-BR12-2 less than 2 times the average is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000041'), 'none', 'T-BR13-2 under R1,000.00 is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000042'), 'none', 'T-BR13-2 within 30 days of the earliest transaction is not flagged');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000053'), 'higher_than_usual', 'T-BR14-1 first large payment is higher_than_usual');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000054'), 'double_charge', 'T-BR14-1 a match for BR11 and BR12 gets only double_charge');
select is(pg_temp.flag('a0000000-0000-0000-0000-000000000062'), 'none', 'T-BR14-1 money in is never flagged, even as a repeat');

select is((select flag_status from public.transactions where id = 'a0000000-0000-0000-0000-000000000053'), 'open', 'T-BR14-2 a new flag starts open');

set local role authenticated;
select throws_ok($$ select public.recalculate_flags('11111111-1111-1111-1111-111111111151') $$, null, 'recalculate_flags cannot be called by authenticated');
set local role anon;
select throws_ok($$ select public.recalculate_flags('11111111-1111-1111-1111-111111111151') $$, null, 'recalculate_flags cannot be called by anon');

select * from finish();
rollback;
