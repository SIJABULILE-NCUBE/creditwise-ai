-- 0005_cleanup.sql: Daily cleanup job

create or replace function public.cleanup_old_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff_date date;
  v_user_record record;
begin
  -- Cutoff is 90 days before today (SAST)
  v_cutoff_date := timezone('Africa/Johannesburg', now())::date - 90;

  -- 1. Identify users with old transactions before deleting
  for v_user_record in (
    select distinct user_id
    from public.transactions
    where date < v_cutoff_date
  ) loop
    -- Delete old transactions for this user
    delete from public.transactions
    where user_id = v_user_record.user_id
      and date < v_cutoff_date;

    -- Recalculate flags for this user
    perform public.recalculate_flags(v_user_record.user_id);
  end loop;

  -- 2. Delete chat messages older than 30 days
  delete from public.chat_messages
  where created_at < (now() - interval '30 days');
end;
$$;

-- Enable pg_cron and schedule the job
create extension if not exists pg_cron;

-- Remove existing job if any before scheduling
select cron.unschedule('cleanup_old_data')
where exists (select 1 from cron.job where jobname = 'cleanup_old_data');

select cron.schedule('cleanup_old_data', '0 0 * * *', 'select public.cleanup_old_data()');
