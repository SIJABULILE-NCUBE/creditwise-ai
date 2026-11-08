-- 0002_triggers.sql: Automatic jobs and triggers

-- 1. handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (
    id,
    email,
    first_name,
    is_18_or_older,
    privacy_accepted_at
  )
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'first_name', 'User'),
    coalesce((new.raw_user_meta_data->>'is_18_or_older')::boolean, false),
    now()
  );

  insert into public.money_profiles (
    user_id,
    setup_step
  )
  values (
    new.id,
    1
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. touch_money_profile
create or replace function public.touch_money_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if TG_TABLE_NAME = 'money_profiles' then
    new.updated_at = now();
    return new;
  end if;

  v_user_id := coalesce(new.user_id, old.user_id);
  update public.money_profiles
  set updated_at = now()
  where user_id = v_user_id;

  return coalesce(new, old);
end;
$$;

create trigger touch_money_profile_on_update
  before update on public.money_profiles
  for each row execute function public.touch_money_profile();

create trigger touch_money_profile_on_debts
  after insert or update or delete on public.debts
  for each row execute function public.touch_money_profile();

create trigger touch_money_profile_on_expenses
  after insert or update or delete on public.expenses
  for each row execute function public.touch_money_profile();


-- 3. limit_debts
create or replace function public.limit_debts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.debts
  where user_id = new.user_id;

  if v_count >= 15 then
    raise exception 'limit_debts';
  end if;

  return new;
end;
$$;

create trigger check_limit_debts
  before insert on public.debts
  for each row execute function public.limit_debts();


-- 4. limit_expenses
create or replace function public.limit_expenses()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.expenses
  where user_id = new.user_id;

  if v_count >= 20 then
    raise exception 'limit_expenses';
  end if;

  return new;
end;
$$;

create trigger check_limit_expenses
  before insert on public.expenses
  for each row execute function public.limit_expenses();


-- 5. check_has_no_debts
create or replace function public.check_has_no_debts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_debt_count integer;
begin
  if TG_OP = 'UPDATE' and TG_TABLE_NAME = 'money_profiles' then
    if new.has_no_debts = true then
      select count(*) into v_debt_count
      from public.debts
      where user_id = new.user_id;

      if v_debt_count > 0 then
        raise exception 'check_has_no_debts';
      end if;
    end if;
    return new;
  elsif TG_OP = 'INSERT' and TG_TABLE_NAME = 'debts' then
    update public.money_profiles
    set has_no_debts = false
    where user_id = new.user_id and has_no_debts = true;
    return new;
  end if;

  return new;
end;
$$;

create trigger check_has_no_debts_on_money_profile
  before update on public.money_profiles
  for each row execute function public.check_has_no_debts();

create trigger check_has_no_debts_on_debts
  after insert on public.debts
  for each row execute function public.check_has_no_debts();


-- 6. check_profile_complete
create or replace function public.check_profile_complete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expense_count integer;
  v_debt_count integer;
begin
  if new.completed_at is not null and (old.completed_at is null or new.completed_at <> old.completed_at) then
    if new.gross_income is null or new.net_income is null then
      raise exception 'check_profile_complete';
    end if;

    select count(*) into v_expense_count
    from public.expenses
    where user_id = new.user_id;

    if v_expense_count < 1 then
      raise exception 'check_profile_complete';
    end if;

    select count(*) into v_debt_count
    from public.debts
    where user_id = new.user_id;

    if v_debt_count < 1 and new.has_no_debts = false then
      raise exception 'check_profile_complete';
    end if;
  end if;

  return new;
end;
$$;

create trigger check_profile_complete_trigger
  before update of completed_at on public.money_profiles
  for each row execute function public.check_profile_complete();


-- 7. check_transaction_date
create or replace function public.check_transaction_date()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date;
begin
  v_today := timezone('Africa/Johannesburg', now())::date;

  if new.date > v_today or new.date < (v_today - 90) then
    raise exception 'check_transaction_date';
  end if;

  return new;
end;
$$;

create trigger check_transaction_date
  before insert on public.transactions
  for each row execute function public.check_transaction_date();


-- 8. limit_transactions
create or replace function public.limit_transactions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.transactions
  where user_id = new.user_id;

  if v_count >= 1000 then
    raise exception 'limit_transactions';
  end if;

  return new;
end;
$$;

create trigger check_limit_transactions
  before insert on public.transactions
  for each row execute function public.limit_transactions();


-- 9. guard_flag_status (security invoker)
create or replace function public.guard_flag_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    -- Verify ONLY flag_status changed
    if new.id <> old.id
      or new.user_id <> old.user_id
      or new.date <> old.date
      or new.description <> old.description
      or new.amount <> old.amount
      or new.source <> old.source
      or new.flag_type <> old.flag_type
      or new.created_at <> old.created_at
    then
      raise exception 'guard_flag_status';
    end if;

    -- Verify allowed status transitions from 8.3:
    -- open -> dismissed
    -- dismissed -> open
    -- open -> querying
    -- querying -> resolved
    if not (
      (old.flag_status = 'open' and new.flag_status = 'dismissed') or
      (old.flag_status = 'dismissed' and new.flag_status = 'open') or
      (old.flag_status = 'open' and new.flag_status = 'querying') or
      (old.flag_status = 'querying' and new.flag_status = 'resolved')
    ) then
      raise exception 'guard_flag_status';
    end if;

    new.flag_status_changed_at = now();
  end if;

  return new;
end;
$$;

create trigger guard_flag_status_trigger
  before update on public.transactions
  for each row execute function public.guard_flag_status();
