-- SQL-level recovery evidence; no Auth service or real OAuth session is involved.
begin;
do $$ begin
  if current_database() <> 'recovery_check' then raise exception 'Isolated recovery database required'; end if;
  if (select count(*) from auth.users) <> 2 then raise exception 'Users lost'; end if;
  if (select count(*) from auth.identities) <> 3 then raise exception 'Identities lost'; end if;
  if (select count(distinct provider) from auth.identities where user_id='e5700000-0000-4000-8000-000000000001') <> 2 then raise exception 'Linked identity lost'; end if;
  if (select count(*) from public.categories) <> 10 then raise exception 'Catalog lost'; end if;
  if (select count(*) from public.transactions) <> 2 or (select sum(amount_cents) from public.transactions) <> 13590 then raise exception 'Financial data lost'; end if;
  if (select count(*) from supabase_migrations.schema_migrations) <> 2 then raise exception 'Migration history lost'; end if;
  if (select count(*) from pg_policies where schemaname='public') <> 5 then raise exception 'Policies lost'; end if;
  if exists(select 1 from pg_class where oid in ('public.categories'::regclass,'public.transactions'::regclass) and not relrowsecurity) then raise exception 'RLS lost'; end if;
end $$;
set local role anon;
do $$ begin
  begin perform 1 from public.transactions; raise exception 'Anonymous read permitted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000001',true);
do $$ begin
  if (select count(*) from public.transactions) <> 1 or (select amount_cents from public.transactions) <> 3590 then raise exception 'Owner A isolation/data failed'; end if;
  if (select occurred_on from public.transactions) <> date '2024-02-29' then raise exception 'Civil date lost'; end if;
  if (select description from public.transactions) <> 'Recovery fixture A' then raise exception 'Description lost'; end if;
  update public.transactions set description='Cross-owner' where user_id='e5700000-0000-4000-8000-000000000002';
  if found then raise exception 'Cross-owner update allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000002',true);
do $$ begin
  if (select count(*) from public.transactions) <> 1 or (select amount_cents from public.transactions) <> 10000 then raise exception 'Owner B isolation/data failed'; end if;
end $$;
reset role;
rollback;
select 'Recovery data, identities, history and SQL isolation passed' as result;
