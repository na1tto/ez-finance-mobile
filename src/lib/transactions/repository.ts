import type { SupabaseClient } from '@supabase/supabase-js';
import { transactionCategories } from '../../constants/transactionCategories';
import { monthlyPeriod } from '../../domain/dates';
import { transactionFromRow, transactionInputToRow, transactionTotals, validateTransactionInput } from '../../domain/transactions';
import type { Category, Transaction, TransactionInput, TransactionKind, TransactionQueryResult, TransactionRow } from '../../types/transaction';
import { FinanceError } from './errors';

export type FinancialScope = { userId: string; generation: number };
export type CreateIntent = Readonly<{ id: string; input: Readonly<TransactionInput> }>;
export type FinancialQuery = { month?: string; categoryId?: string; kind?: TransactionKind };
const columns = 'id,user_id,kind,description,amount_cents,category_id,occurred_on,created_at';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function checkId(id: string) { if (!uuid.test(id)) throw new FinanceError('not-found'); }
function sameInput(row: Transaction, input: TransactionInput) {
  return row.kind === input.kind && row.description === input.description && row.amountCents === input.amountCents
    && row.categoryId === input.categoryId && row.occurredOn === input.occurredOn;
}
export function createIntent(input: TransactionInput, randomId: () => string): CreateIntent {
  const id = randomId(); checkId(id);
  return Object.freeze({ id, input: Object.freeze(validateTransactionInput(input)) });
}

// This repository uses the application's public/session client. Scope is the validated
// Auth/controller state, never a form field or a second credentials store.
export class TransactionRepository {
  private tails = new Map<string, Promise<unknown>>();
  private uncertainUpdates = new Map<string, TransactionInput>();
  private uncertainDeletes = new Set<string>();
  clearOperationMemory() { this.uncertainUpdates.clear(); this.uncertainDeletes.clear(); }
  private stillCurrent(s: FinancialScope) { try { this.current(s); return true; } catch { return false; } }
  constructor(private client: SupabaseClient, private scope: () => FinancialScope | null,
    private revalidateSession: () => void = () => {}, private pageSize = 200, private timeoutMs = 15000) {
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) throw new Error('Página técnica inválida.');
  }
  private authorized() { const s = this.scope(); if (!s) throw new FinanceError('unauthorized'); return { ...s }; }
  private current(s: FinancialScope) {
    const now = this.scope();
    if (!now || now.userId !== s.userId || now.generation !== s.generation) throw new FinanceError('stale');
  }
  private async send<T>(request: { setHeader(name: string, value: string): unknown; abortSignal(signal: AbortSignal): PromiseLike<{ data: T | null; error: { code?: string } | null; status: number }> }, s: FinancialScope, writing = false): Promise<T> {
    this.current(s);
    const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), this.timeoutMs);
    try {
      // Pin the shared SDK's token to this validated owner. If Auth changes while
      // fetchWithAuth awaits its storage lock, an A draft must never be inserted as B.
      const session = await this.client.auth.getSession();
      this.current(s);
      if (session.error || session.data.session?.user.id !== s.userId) {
        this.revalidateSession(); throw new FinanceError('unauthorized');
      }
      request.setHeader('Authorization', `Bearer ${session.data.session.access_token}`);
      const response = await request.abortSignal(abort.signal);
      if (response.error) {
        if (response.status === 401 || ['PGRST301', 'PGRST302', 'PGRST303'].includes(response.error.code ?? '')) {
          this.revalidateSession(); throw new FinanceError('unauthorized');
        }
        if (response.error.code === '23505') throw new FinanceError('conflict');
        if (response.status === 0 || response.status >= 500) throw new FinanceError(writing ? 'uncertain' : 'unavailable');
        throw new FinanceError(writing ? 'invalid' : 'unavailable');
      }
      this.current(s);
      if (response.data === null) throw new FinanceError(writing ? 'uncertain' : 'unavailable');
      return response.data;
    } catch (e) {
      if (e instanceof FinanceError) throw e;
      throw new FinanceError(writing ? 'uncertain' : 'unavailable');
    } finally { clearTimeout(timer); }
  }
  private serialized<T>(s: FinancialScope, id: string, task: () => Promise<T>): Promise<T> {
    const key = s.userId + ':' + id;
    const previous = this.tails.get(key) ?? Promise.resolve();
    const promise = previous.catch(() => {}).then(() => { this.current(s); return task(); });
    this.tails.set(key, promise);
    void promise.finally(() => { if (this.tails.get(key) === promise) this.tails.delete(key); }).catch(() => {});
    return promise;
  }
  private decode(row: TransactionRow, s: FinancialScope) {
    checkId(row.id);
    if (row.user_id !== s.userId) throw new FinanceError('unauthorized');
    return transactionFromRow(row);
  }
  private async read(id: string, s: FinancialScope) {
    checkId(id);
    const rows = await this.send<TransactionRow[]>(this.client.from('transactions').select(columns).eq('id', id).eq('user_id', s.userId), s);
    return rows.length ? this.decode(rows[0], s) : null;
  }
  get(id: string) { return this.read(id, this.authorized()); }
  async categories(): Promise<readonly Category[]> {
    const s = this.authorized();
    const rows = await this.send<Category[]>(this.client.from('categories').select('id,kind,name').order('id'), s);
    if (rows.length !== transactionCategories.length || transactionCategories.some(expected => !rows.some(row =>
      row.id === expected.id && row.kind === expected.kind && row.name === expected.name))) throw new FinanceError('catalog');
    return transactionCategories.map(expected => Object.freeze({ ...rows.find(row => row.id === expected.id)! }));
  }
  async query(filter: FinancialQuery = {}): Promise<TransactionQueryResult> {
    const s = this.authorized();
    const period = filter.month === undefined ? null : monthlyPeriod(filter.month);
    if (filter.categoryId !== undefined && !transactionCategories.some(c => c.id === filter.categoryId)) throw new FinanceError('invalid');
    if (filter.kind !== undefined && !['income', 'expense'].includes(filter.kind)) throw new FinanceError('invalid');
    const items: Transaction[] = []; const seen = new Set<string>(); let cursor: Transaction | undefined;
    for (;;) {
      let request = this.client.from('transactions').select(columns).eq('user_id', s.userId)
        .order('occurred_on', { ascending: false }).order('id', { ascending: false }).limit(this.pageSize);
      if (filter.kind) request = request.eq('kind', filter.kind);
      if (filter.categoryId) request = request.eq('category_id', filter.categoryId);
      if (period) { request = request.gte('occurred_on', period.start); if (period.endExclusive) request = request.lt('occurred_on', period.endExclusive); }
      if (cursor) request = request.or(`occurred_on.lt.${cursor.occurredOn},and(occurred_on.eq.${cursor.occurredOn},id.lt.${cursor.id})`);
      const rows = await this.send<TransactionRow[]>(request, s);
      if (!rows.length) break; // Not a short page: the gateway can cap below our requested size.
      for (const row of rows) {
        const item = this.decode(row, s);
        if (seen.has(item.id) || (cursor && (item.occurredOn > cursor.occurredOn || (item.occurredOn === cursor.occurredOn && item.id >= cursor.id)))) throw new FinanceError('unavailable');
        seen.add(item.id); items.push(item); cursor = item;
      }
    }
    return { transactions: items, totals: transactionTotals(items) };
  }
  create(intent: CreateIntent): Promise<Transaction> {
    const s = this.authorized(); checkId(intent.id);
    const input = validateTransactionInput(intent.input);
    return this.serialized(s, intent.id, async () => {
      const existing = await this.read(intent.id, s);
      if (existing) { if (!sameInput(existing, input)) throw new FinanceError('conflict'); return existing; }
      try {
        const rows = await this.send<TransactionRow[]>(this.client.from('transactions').insert({ id: intent.id, ...transactionInputToRow(input) }).select(columns), s, true);
        if (rows.length !== 1) throw new FinanceError('uncertain');
        const created = this.decode(rows[0], s);
        if (!sameInput(created, input)) throw new FinanceError('conflict'); return created;
      } catch (e) {
        if (!(e instanceof FinanceError) || e.code !== 'conflict') throw e;
        const reconciled = await this.read(intent.id, s);
        if (reconciled && sameInput(reconciled, input)) return reconciled;
        throw new FinanceError('conflict');
      }
    });
  }
  update(id: string, input: TransactionInput): Promise<Transaction> {
    const s = this.authorized(); checkId(id); const normalized = validateTransactionInput(input);
    const key = s.userId + ':' + id;
    return this.serialized(s, id, async () => {
      const pending = this.uncertainUpdates.get(key);
      if (pending && JSON.stringify(pending) !== JSON.stringify(normalized)) throw new FinanceError('conflict');
      const existing = await this.read(id, s); if (!existing) throw new FinanceError('not-found');
      if (pending && sameInput(existing, normalized)) { this.uncertainUpdates.delete(key); return existing; }
      try {
        const rows = await this.send<TransactionRow[]>(this.client.from('transactions').update(transactionInputToRow(normalized)).eq('id', id).eq('user_id', s.userId).select(columns), s, true);
        if (!rows.length) throw new FinanceError('not-found');
        if (rows.length !== 1) throw new FinanceError('uncertain');
        const updated = this.decode(rows[0], s);
        if (!sameInput(updated, normalized) || updated.createdAt !== existing.createdAt) throw new FinanceError('uncertain');
        this.uncertainUpdates.delete(key); return updated;
      } catch (e) {
        if (this.stillCurrent(s) && e instanceof FinanceError && ['uncertain', 'stale'].includes(e.code)) this.uncertainUpdates.set(key, normalized);
        throw e;
      }
    });
  }
  delete(id: string): Promise<{ id: string; confirmed: true; reconciled: boolean }> {
    const s = this.authorized(); checkId(id); const key = s.userId + ':' + id;
    return this.serialized(s, id, async () => {
      const existing = await this.read(id, s);
      if (!existing) {
        if (!this.uncertainDeletes.has(key)) throw new FinanceError('not-found');
        this.uncertainDeletes.delete(key); return { id, confirmed: true, reconciled: true };
      }
      try {
        const rows = await this.send<{ id: string }[]>(this.client.from('transactions').delete().eq('id', id).eq('user_id', s.userId).select('id'), s, true);
        if (!rows.length && await this.read(id, s)) throw new FinanceError('uncertain');
        this.uncertainDeletes.delete(key); return { id, confirmed: true, reconciled: !rows.length };
      } catch (e) {
        if (this.stillCurrent(s) && e instanceof FinanceError && ['uncertain', 'stale'].includes(e.code)) this.uncertainDeletes.add(key);
        throw e;
      }
    });
  }
}
