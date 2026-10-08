-- Pre-evaluation verification ONLY in the empty Ez Finance destination.
-- Synthetic identities/records exist solely inside this transaction and are rolled back.
begin;
do $$ begin
  if (select count(*) from auth.users) <> 0 or (select count(*) from public.transactions) <> 0 then
    raise exception 'Empty destination required; hosted verification refused';
  end if;
  if (select count(*) from public.categories) <> 10 then raise exception 'Catalog mismatch'; end if;
end $$;
insert into auth.users(id) values
  ('e5700000-0000-4000-8000-000000000001'),
  ('e5700000-0000-4000-8000-000000000002');

set local role anon;
do $$ begin
  begin
    perform 1 from public.transactions;
    raise exception 'Anonymous financial read allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.categories;
    raise exception 'Anonymous catalog read allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000001',true);
insert into public.transactions(id,kind,description,amount_cents,category_id,occurred_on)
values ('e5710000-0000-4000-8000-000000000001','expense','Hosted verification',3590,'expense-food','2024-02-29');
do $$ begin
  if (select count(*) from public.transactions) <> 1 then raise exception 'Owner read failed'; end if;
  begin
    insert into public.transactions(id,kind,description,amount_cents,category_id,occurred_on)
    values ('e5710000-0000-4000-8000-000000000001','expense','Duplicate',3590,'expense-food','2024-02-29');
    raise exception 'Duplicate UUID accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.transactions(kind,description,amount_cents,category_id,occurred_on)
    values ('expense','Zero',0,'expense-food','2024-02-29');
    raise exception 'Zero amount accepted';
  exception when check_violation then null; end;
  begin
    update public.transactions set user_id='e5700000-0000-4000-8000-000000000002';
    raise exception 'Owner mutation accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.transactions set occurred_on=(statement_timestamp() at time zone 'America/Sao_Paulo')::date + 1;
    raise exception 'Future date accepted';
  exception when check_violation then null; end;
end $$;

select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000002',true);
do $$ declare affected integer; begin
  if (select count(*) from public.transactions) <> 0 then raise exception 'Cross-owner read'; end if;
  update public.transactions set description='Cross-owner modification';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner update'; end if;
  delete from public.transactions;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner delete'; end if;
  begin
    insert into public.transactions(user_id,kind,description,amount_cents,category_id,occurred_on)
    values ('e5700000-0000-4000-8000-000000000001','expense','Impersonation',1,'expense-food','2024-02-29');
    raise exception 'Cross-owner insert';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000001',true);
update public.transactions set amount_cents=4000;
do $$ begin
  if (select amount_cents from public.transactions) is distinct from 4000 then raise exception 'Owner update failed'; end if;
end $$;
delete from public.transactions;
do $$ begin
  if (select count(*) from public.transactions) <> 0 then raise exception 'Owner delete failed'; end if;
end $$;
reset role;
rollback;
select 'SQL isolation, CRUD and constraints passed; fixtures rolled back' as result,
  (select count(*) from auth.users) as users,
  (select count(*) from public.transactions) as transactions;
