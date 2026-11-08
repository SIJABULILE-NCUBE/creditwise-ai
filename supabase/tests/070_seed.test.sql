begin;
select plan(7);

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

select * from finish();
rollback;
