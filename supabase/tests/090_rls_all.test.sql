begin;
select plan(1);

select is(
  (select coalesce(array_agg(tablename::text order by tablename), '{}') from pg_tables where schemaname = 'public' and not rowsecurity),
  '{}'::text[],
  'T-DB-6 every table in public has RLS enabled'
);

select * from finish();
rollback;
