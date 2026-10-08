-- Run via `supabase test db` AFTER applying migrations to a disposable local stack.
-- All fixtures and the test extension are rolled back. Never run against real accounts.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select has_table('public', 'categories', 'S01: categories exists');
select has_table('public', 'transactions', 'S01: transactions exists');
select is((select count(*)::integer from public.categories), 10, 'C01/S01: ten fixed categories');
select ok((select relrowsecurity from pg_class where oid = 'public.transactions'::regclass), 'S01: transaction RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.categories'::regclass), 'S01: category RLS enabled');

-- Fixtures are deliberately outside deployable migrations (S02).
insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.transactions (id,user_id,kind,description,amount_cents,category_id,occurred_on) values
  ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','expense','A',3590,'expense-food','2024-02-29'),
  ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','income','B',10000,'income-salary','2024-02-29');

set local role anon;
select set_config('request.jwt.claims','{}',true);
select set_config('request.jwt.claim.sub','',true);
select throws_ok('select * from public.transactions','42501',null,'A01: anon cannot read');
select throws_ok($$insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values ('expense','anon',1,'expense-food','2024-02-29')$$,'42501',null,'A01: anon cannot insert');
select throws_ok($$update public.transactions set description='anon'$$,'42501',null,'A01: anon cannot update');
select throws_ok('delete from public.transactions','42501',null,'A01: anon cannot delete');
select throws_ok('select * from public.categories','42501',null,'A01: anon cannot read catalog');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{}',true);
select is((select count(*)::integer from public.transactions),0,'A01: authenticated role without identity sees nothing');
select throws_ok($$insert into public.transactions(user_id,kind,description,amount_cents,category_id,occurred_on) values ('00000000-0000-4000-8000-000000000001','expense','no identity',1,'expense-food','2024-02-29')$$,'42501',null,'A01: missing identity cannot insert');
with changed as (update public.transactions set description='no identity' returning id)
select is((select count(*)::integer from changed),0,'A01: missing identity cannot update');
with changed as (delete from public.transactions returning id)
select is((select count(*)::integer from changed),0,'A01: missing identity cannot delete');

select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*)::integer from public.transactions),1,'A02: A reads only own row');
select is((select count(*)::integer from public.categories),10,'A04: authenticated catalog read');
select lives_ok($$insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values ('expense',' New A ',1,'expense-food',(statement_timestamp() at time zone 'America/Sao_Paulo')::date)$$,'A02/D01/M02: insert today with owner default and minimum');
select is((select description from public.transactions where amount_cents=1),'New A','V01: description trimmed');
select lives_ok($$update public.transactions set amount_cents=99999999, description='Edited A' where description='New A'$$,'A02/M02: update own row to maximum');
select is((select count(*)::integer from public.transactions where description='Edited A'),1,'A02: own update persisted');
select lives_ok($$delete from public.transactions where description='Edited A'$$,'A02: delete own row');
select is((select count(*)::integer from public.transactions),1,'A02: own delete persisted');

select is((select count(*)::integer from public.transactions where id='10000000-0000-4000-8000-000000000002'),0,'A03: B inaccessible by ID');
with changed as (update public.transactions set description='stolen' where id='10000000-0000-4000-8000-000000000002' returning id)
select is((select count(*)::integer from changed),0,'A03: update B affects zero rows');
with changed as (delete from public.transactions where id='10000000-0000-4000-8000-000000000002' returning id)
select is((select count(*)::integer from changed),0,'A03: delete B affects zero rows');
select throws_ok($$insert into public.transactions(user_id,kind,description,amount_cents,category_id,occurred_on) values ('00000000-0000-4000-8000-000000000002','expense','forged',1,'expense-food','2024-02-29')$$,'42501',null,'A03: insert for B rejected by RLS');
select throws_ok($$update public.transactions set user_id='00000000-0000-4000-8000-000000000002' where id='10000000-0000-4000-8000-000000000001'$$,'42501',null,'A03: ownership cannot be transferred');
select throws_ok($$update public.transactions set id=gen_random_uuid()$$,'42501',null,'A03: identity cannot be edited');
select throws_ok($$update public.transactions set created_at=now()$$,'42501',null,'A03: creation instant cannot be edited');
select throws_ok($$insert into public.categories values ('custom','expense','Custom')$$,'42501',null,'A04: category insert denied');
select throws_ok($$update public.categories set name='Custom'$$,'42501',null,'A04: category update denied');
select throws_ok('delete from public.categories','42501',null,'A04: category delete denied');

select throws_ok($$insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values ('income','wrong category',1,'expense-food','2024-02-29')$$,'23503',null,'C01: kind/category mismatch');
select throws_ok($$insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values ('expense','missing',1,'missing','2024-02-29')$$,'23503',null,'C01: unknown category');
select throws_ok($$update public.transactions set kind='income'$$,'23503',null,'C01: mismatch on edit');
select throws_ok($$update public.transactions set amount_cents=0$$,'23514',null,'V01: zero rejected');
select throws_ok($$update public.transactions set amount_cents=-1$$,'23514',null,'V01: negative rejected');
select throws_ok($$update public.transactions set amount_cents=100000000$$,'23514',null,'V01: above maximum rejected');
select throws_ok($$update public.transactions set amount_cents='1.5'$$,'22P02',null,'V01: fractional integer text rejected');
select throws_ok($$update public.transactions set description=E' \t\n '$$,'23514',null,'V01: whitespace description rejected');
select throws_ok($$update public.transactions set description=U&'\00A0\FEFF'$$,'23514',null,'V01: Unicode whitespace description rejected');
select throws_ok($$update public.transactions set occurred_on=(statement_timestamp() at time zone 'America/Sao_Paulo')::date + 1$$,'23514',null,'D01: future on update rejected');
select throws_ok($$insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values ('expense','future',1,'expense-food',(statement_timestamp() at time zone 'America/Sao_Paulo')::date + 1)$$,'23514',null,'D01: future on insert rejected');
select throws_ok($$update public.transactions set occurred_on='2025-02-29'$$,'22008',null,'D02: invalid leap day');
select throws_ok($$update public.transactions set occurred_on='2026-02-30'$$,'22008',null,'D02: nonexistent date');
select throws_ok($$update public.transactions set occurred_on='infinity'$$,'23514',null,'D02: infinite date rejected');
select lives_ok($$update public.transactions set occurred_on='2024-02-29'$$,'D02: valid leap day');

insert into public.transactions(kind,description,amount_cents,category_id,occurred_on) values
  ('expense','Month first',10,'expense-food','2025-12-01'),
  ('expense','Month last',20,'expense-food','2025-12-31'),
  ('income','Next month',100,'income-salary','2026-01-01');
select is((select sum(amount_cents)::bigint from public.transactions where occurred_on >= '2025-12-01' and occurred_on < '2026-01-01'),30::bigint,'D03/M04: December inclusive/exclusive civil bounds');
select is((select count(*)::integer from public.transactions where occurred_on >= '2026-01-01' and occurred_on < '2026-02-01' and category_id='expense-food'),0,'D03/M05: month/category filter applies before totals');

select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*)::integer from public.transactions),1,'A03: B still has exactly one row');
select is((select description from public.transactions),'B','A03: B data unchanged');
select is((select sum(amount_cents)::bigint from public.transactions),10000::bigint,'A03: aggregate sees only B');
reset role;
select throws_ok($$delete from auth.users where id='00000000-0000-4000-8000-000000000001'$$,'23503',null,'S01: deleting identity does not silently cascade financial data');
select * from finish();
rollback;
