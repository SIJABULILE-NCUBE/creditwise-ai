begin;
select plan(2);

insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111161', 'status2.test@example.com', '{"first_name": "StatusTwo", "is_18_or_older": true}'::jsonb);

insert into public.transactions (id, user_id, date, description, amount, source, flag_type, flag_status)
values ('88888888-8888-8888-8888-888888888891', '11111111-1111-1111-1111-111111111161', timezone('Africa/Johannesburg', now())::date - 1, 'Flagged', -500, 'manual', 'double_charge', 'open');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111161', 'role', 'authenticated')::text, true);

update public.transactions set flag_status = 'dismissed' where id = '88888888-8888-8888-8888-888888888891';
select ok((select flag_status_changed_at is not null from public.transactions where id = '88888888-8888-8888-8888-888888888891'), 'T-BR14-3 a status change sets flag_status_changed_at');

select throws_ok($$ update public.transactions set flag_status_changed_at = null where id = '88888888-8888-8888-8888-888888888891' $$, null, 'T-BR14-3 flag_status_changed_at cannot be changed directly');

select * from finish();
rollback;
