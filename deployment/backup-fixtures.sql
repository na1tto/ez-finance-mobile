-- Only in the isolated recovery rehearsal. Never run on a linked project.
begin;
do $$ begin
  if current_database() <> 'restore_validation' then raise exception 'Isolated database required'; end if;
  if exists(select 1 from auth.users) or exists(select 1 from public.transactions) then raise exception 'Empty rehearsal required'; end if;
end $$;
insert into auth.users(id,email,email_confirmed_at,encrypted_password) values
('e5700000-0000-4000-8000-000000000001','recovery-a@example.invalid',now(),'synthetic-not-authenticatable'),
('e5700000-0000-4000-8000-000000000002','recovery-b@example.invalid',now(),'synthetic-not-authenticatable');
insert into auth.identities(provider_id,user_id,identity_data,provider) values
('e5700000-0000-4000-8000-000000000001','e5700000-0000-4000-8000-000000000001','{"sub":"e5700000-0000-4000-8000-000000000001","email":"recovery-a@example.invalid","email_verified":true}','email'),
('synthetic-google-a','e5700000-0000-4000-8000-000000000001','{"sub":"synthetic-google-a","email":"recovery-a@example.invalid","email_verified":true}','google'),
('e5700000-0000-4000-8000-000000000002','e5700000-0000-4000-8000-000000000002','{"sub":"e5700000-0000-4000-8000-000000000002","email":"recovery-b@example.invalid","email_verified":true}','email');
set local role authenticated;
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000001',true);
insert into public.transactions(id,kind,description,amount_cents,category_id,occurred_on) values
('e5710000-0000-4000-8000-000000000001','expense','Recovery fixture A',3590,'expense-food','2024-02-29');
select set_config('request.jwt.claim.sub','e5700000-0000-4000-8000-000000000002',true);
insert into public.transactions(id,kind,description,amount_cents,category_id,occurred_on) values
('e5710000-0000-4000-8000-000000000002','income','Recovery fixture B',10000,'income-salary','2024-03-01');
commit;
