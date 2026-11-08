begin;
select plan(9);

-- T-DB-4: Thando seed checks
select is(
  (select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-000000000001' and flag_status = 'open'),
  3::bigint,
  'T-DB-4 Thando has exactly 3 open flags'
);

select is(
  (select gross_income from public.money_profiles where user_id = '00000000-0000-0000-0000-000000000001'),
  25000.00::numeric,
  'T-DB-4 Thando gross income is 25000.00'
);

select is(
  (select sum(monthly_repayment) from public.debts where user_id = '00000000-0000-0000-0000-000000000001'),
  9000.00::numeric,
  'T-DB-4 Thando total debt repayments are 9000.00'
);

-- Sibusiso seed checks
select is(
  (select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-000000000002' and flag_status = 'querying'),
  1::bigint,
  'T-DB-4 Sibusiso has exactly 1 querying flag'
);

select is(
  (select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-000000000002' and flag_status = 'open'),
  0::bigint,
  'T-DB-4 Sibusiso has 0 open flags'
);

-- T-DB-5: Guides & checklist items
select is(
  (select count(*) from public.guides),
  3::bigint,
  'T-DB-5 exactly 3 guides exist'
);

select is(
  (select count(*) from public.checklist_items where guide_id in (select id from public.guides)),
  (select count(*) from public.checklist_items),
  'T-DB-5 checklist items belong to existing guides'
);

select results_eq(
  $$ select description from public.transactions where user_id = '00000000-0000-0000-0000-000000000001' and flag_status = 'open' order by description $$,
  array['FITZONE GYM DEBIT', 'ONLINE TECH STORE', 'PREPAID ELECTRICITY'],
  'T-DB-4 Thando''s open flags are the 3 named transactions'
);

select ok(
  (select bool_and(n between 5 and 8) from (select count(*) n from public.checklist_items group by guide_id) c),
  'T-DB-5 each guide has 5 to 8 checklist items'
);

select * from finish();
rollback;
