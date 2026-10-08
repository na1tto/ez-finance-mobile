-- Stable operation ID for insert/reconciliation. No ownership or UPDATE grant change.
grant insert (id) on public.transactions to authenticated;

