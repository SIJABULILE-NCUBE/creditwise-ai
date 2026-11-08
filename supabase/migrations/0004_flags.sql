-- 0004_flags.sql: Helper compare_description and recalculate_flags

create or replace function public.compare_description(p_desc text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(regexp_replace(regexp_replace(lower(coalesce(p_desc, '')), '\d', '', 'g'), '\s+', ' ', 'g'));
$$;

create or replace function public.recalculate_flags(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_min_date date;
  r record;
  v_calculated_flag text;
  v_new_status text;
  v_earlier_count integer;
  v_earlier_avg numeric;
  v_has_double boolean;
begin
  -- Get user's earliest stored transaction date
  select min(date) into v_min_date
  from public.transactions
  where user_id = p_user_id;

  -- Iterate over all user's transactions ordered by date asc, created_at asc, id asc
  for r in (
    select
      t.id,
      t.date,
      t.description,
      t.amount,
      t.flag_type as current_flag_type,
      t.flag_status as current_flag_status,
      t.created_at,
      public.compare_description(t.description) as clean_desc
    from public.transactions t
    where t.user_id = p_user_id
    order by t.date asc, t.created_at asc, t.id asc
  ) loop
    v_calculated_flag := 'none';

    -- Flags only apply to money-out (negative amount)
    if r.amount < 0 then
      -- 1. BR11: Possible double charge
      -- Check if there is an earlier or equal-date preceding transaction within 0 to 3 days
      -- with same clean_desc and same amount
      select exists (
        select 1
        from public.transactions t2
        where t2.user_id = p_user_id
          and t2.id <> r.id
          and t2.amount = r.amount
          and public.compare_description(t2.description) = r.clean_desc
          and (
            (t2.date < r.date and t2.date >= (r.date - 3))
            or (t2.date = r.date and (t2.created_at < r.created_at or (t2.created_at = r.created_at and t2.id < r.id)))
          )
      ) into v_has_double;

      if v_has_double then
        v_calculated_flag := 'double_charge';
      end if;

      -- 2. BR12: Higher than usual (if not double_charge)
      if v_calculated_flag = 'none' and abs(r.amount) >= 200.00 then
        select
          count(*),
          coalesce(avg(abs(t2.amount)), 0)
        into v_earlier_count, v_earlier_avg
        from public.transactions t2
        where t2.user_id = p_user_id
          and t2.id <> r.id
          and t2.amount < 0
          and public.compare_description(t2.description) = r.clean_desc
          and (
            t2.date < r.date
            or (t2.date = r.date and (t2.created_at < r.created_at or (t2.created_at = r.created_at and t2.id < r.id)))
          );

        if v_earlier_count >= 2 and abs(r.amount) >= (2 * v_earlier_avg) then
          v_calculated_flag := 'higher_than_usual';
        end if;
      end if;

      -- 3. BR13: New payee (if not double_charge or higher_than_usual)
      if v_calculated_flag = 'none' and abs(r.amount) >= 1000.00 and v_min_date is not null and r.date >= (v_min_date + 30) then
        select count(*) into v_earlier_count
        from public.transactions t2
        where t2.user_id = p_user_id
          and t2.id <> r.id
          and t2.amount < 0
          and public.compare_description(t2.description) = r.clean_desc
          and (
            t2.date < r.date
            or (t2.date = r.date and (t2.created_at < r.created_at or (t2.created_at = r.created_at and t2.id < r.id)))
          );

        if v_earlier_count = 0 then
          v_calculated_flag := 'new_payee';
        end if;
      end if;
    end if;

    -- Determine new flag_status
    if v_calculated_flag = 'none' then
      v_new_status := 'none';
    else
      if r.current_flag_status <> 'none' then
        v_new_status := r.current_flag_status; -- preserve existing status (querying, dismissed, resolved, open)
      else
        v_new_status := 'open';
      end if;
    end if;

    -- Update if changed
    if v_calculated_flag <> r.current_flag_type or v_new_status <> r.current_flag_status then
      update public.transactions
      set
        flag_type = v_calculated_flag,
        flag_status = v_new_status
      where id = r.id;
    end if;
  end loop;
end;
$$;

-- Permissions: Only service_role and postgres can execute
revoke all on function public.recalculate_flags(uuid) from public, anon, authenticated;
grant execute on function public.recalculate_flags(uuid) to postgres, service_role;
