-- Product reference data only; no local users or financial fixtures.
create table public.categories (
  id text primary key,
  kind text not null check (kind in ('income', 'expense')),
  name text not null check (length(btrim(name)) > 0),
  unique (id, kind)
);

insert into public.categories (id, kind, name) values
  ('expense-food', 'expense', 'Alimentação'),
  ('expense-transport', 'expense', 'Transporte'),
  ('expense-leisure', 'expense', 'Lazer'),
  ('expense-health', 'expense', 'Saúde'),
  ('expense-education', 'expense', 'Educação'),
  ('expense-other', 'expense', 'Outros'),
  ('income-salary', 'income', 'Salário'),
  ('income-extra', 'income', 'Trabalho extra'),
  ('income-yield', 'income', 'Rendimentos'),
  ('income-other', 'income', 'Outras receitas');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  kind text not null check (kind in ('income', 'expense')),
  description text not null check (length(description) > 0),
  amount_cents integer not null check (amount_cents between 1 and 99999999),
  category_id text not null,
  occurred_on date not null check (occurred_on between date '0001-01-01' and date '9999-12-31'),
  created_at timestamptz not null default statement_timestamp(),
  foreign key (category_id, kind) references public.categories(id, kind)
);

create index transactions_user_occurred_on_idx on public.transactions (user_id, occurred_on);

-- Clock-dependent checks run on every INSERT/UPDATE, even if only the description changes.
-- statement_timestamp avoids stale transaction-start dates across midnight.
create function public.validate_financial_transaction()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.occurred_on > (statement_timestamp() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Future transaction date is not allowed' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id or new.user_id is distinct from old.user_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Transaction identity is immutable' using errcode = '23514';
  end if;
  -- Same whitespace set as ECMAScript String.trim(), without truncating content.
  new.description := btrim(new.description,
    U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  return new;
end;
$$;
revoke all on function public.validate_financial_transaction() from public, anon, authenticated;
create trigger validate_financial_transaction before insert or update on public.transactions
for each row execute function public.validate_financial_transaction();

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Remove Supabase default table privileges before granting only the intended surface.
revoke all on public.categories, public.transactions from public, anon, authenticated;
grant select on public.categories to authenticated;
grant select, delete on public.transactions to authenticated;
grant insert (user_id, kind, description, amount_cents, category_id, occurred_on)
  on public.transactions to authenticated;
grant update (kind, description, amount_cents, category_id, occurred_on)
  on public.transactions to authenticated;

create policy categories_authenticated_read on public.categories for select to authenticated
using ((select auth.uid()) is not null);
create policy transactions_owner_read on public.transactions for select to authenticated
using ((select auth.uid()) = user_id);
create policy transactions_owner_insert on public.transactions for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy transactions_owner_update on public.transactions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transactions_owner_delete on public.transactions for delete to authenticated
using ((select auth.uid()) = user_id);
