begin;
select plan(1);

select has_schema('public', 'T-SETUP-2 public schema exists');

select * from finish();
rollback;
