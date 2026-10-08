import { civilToday, monthlyPeriod } from '../../domain/dates';
import { transactionCategories } from '../../constants/transactionCategories';
import { validateTransactionDraft } from '../../domain/transactions';
import type { Category, Transaction, TransactionDraft, TransactionQueryResult } from '../../types/transaction';
import { FinanceError, financeMessage } from './errors';
import { createIntent, type CreateIntent, type FinancialQuery, type FinancialScope, type TransactionRepository } from './repository';

const blank = (): TransactionDraft => ({ kind: 'expense', description: '', amountText: '', categoryId: '', occurredOn: civilToday() });
const reloadFailure = ' A consulta falhou; tente carregar novamente.';
export type FinanceState = {
  owner: string | null; authorized: boolean; status: 'idle' | 'loading' | 'ready' | 'error';
  result: TransactionQueryResult | null; categories: readonly Category[]; readError: string;
  query: MonthlyQuery; confirmedQuery: MonthlyQuery | null;
  draft: TransactionDraft; intent: CreateIntent | null; operation: 'idle' | 'saving' | 'uncertain' | 'error'; writeMessage: string;
};
export type MonthlyQuery = Readonly<{ month: string; categoryId?: string }>;
// Fast Refresh can retain a pre-SPEC-006 controller and subscribed snapshot.
// It must be reloaded, not relabeled with a guessed month over old history.
export function hasMonthlyQuery(state: FinanceState): boolean {
  return typeof state.query?.month === 'string';
}
type SaveResult = { confirmed: boolean; transaction?: Transaction };
type Repository = Pick<TransactionRepository, 'categories' | 'query' | 'create' | 'update' | 'delete'> & Partial<Pick<TransactionRepository, 'clearOperationMemory'>>;
export class FinanceController {
  private generation = 0; private readRevision = 0; private listeners = new Set<() => void>();
  private saving?: Promise<SaveResult>;
  private state: FinanceState = this.empty();
  constructor(private repository: Repository, private randomId: () => string) {}
  private empty(): FinanceState { return { owner: null, authorized: false, status: 'idle', result: null, categories: [], readError: '',
    query: { month: civilToday().slice(0, 7) }, confirmedQuery: null,
    draft: blank(), intent: null, operation: 'idle', writeMessage: '' }; }
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private change(patch: Partial<FinanceState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(fn => fn()); }
  scope(): FinancialScope | null { return this.state.authorized && this.state.owner ? { userId: this.state.owner, generation: this.generation } : null; }
  bind(status: string, userId?: string) {
    if (status === 'signedOut' || status === 'recovery') {
      this.repository.clearOperationMemory?.();
      this.generation++; this.readRevision++; this.saving = undefined; this.state = this.empty(); this.change({}); return;
    }
    if (status !== 'authenticated' || !userId) {
      if (this.state.authorized) {
        this.generation++; this.readRevision++; this.saving = undefined;
        this.change({ authorized: false, operation: this.state.intent ? 'uncertain' : 'idle' });
      }
      return;
    }
    if (this.state.owner !== userId) {
      this.repository.clearOperationMemory?.();
      this.generation++; this.readRevision++; this.saving = undefined; this.state = this.empty();
      this.change({ owner: userId, authorized: true });
    } else if (!this.state.authorized) { this.generation++; this.change({ authorized: true }); }
  }
  private active(s: FinancialScope) { const now = this.scope(); return now?.userId === s.userId && now.generation === s.generation; }
  beginDraft() {
    if (this.scope() && !this.state.intent && this.state.operation !== 'saving' && !this.state.draft.description && !this.state.draft.amountText && !this.state.draft.categoryId)
      this.change({ draft: blank() });
  }
  setDraft(patch: Partial<Omit<TransactionDraft, 'kind'>>) {
    if (!this.scope() || this.state.intent || this.state.operation === 'saving') return false;
    this.change({ draft: { ...this.state.draft, ...patch }, writeMessage: '', operation: 'idle' }); return true;
  }
  async load(filter: FinancialQuery = this.state.query): Promise<boolean> {
    const scope = this.scope(); if (!scope) return false;
    const query: MonthlyQuery = Object.freeze({ month: filter.month ?? this.state.query.month,
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}) });
    monthlyPeriod(query.month);
    if (query.categoryId && !transactionCategories.some(c => c.id === query.categoryId)) throw new FinanceError('invalid');
    const revision = ++this.readRevision;
    this.change({ query, status: 'loading', readError: '' });
    try {
      const [categories, result] = await Promise.all([this.repository.categories(), this.repository.query(query)]);
      if (!this.active(scope) || revision !== this.readRevision) return false;
      this.change({ categories, result, confirmedQuery: query, status: 'ready', writeMessage: this.state.writeMessage.endsWith(reloadFailure)
        ? this.state.writeMessage.slice(0, -reloadFailure.length) : this.state.writeMessage }); return true;
    } catch (e) {
      if (this.active(scope) && revision === this.readRevision) this.change({ status: 'error', readError: financeMessage(e) });
      return false;
    }
  }
  saveDraft(): Promise<SaveResult> {
    if (this.saving) return this.saving;
    const scope = this.scope(); if (!scope) return Promise.resolve({ confirmed: false });
    if (!this.state.categories.length) { this.change({ writeMessage: new FinanceError('catalog').message }); return Promise.resolve({ confirmed: false }); }
    let intent = this.state.intent;
    try { intent ??= createIntent(validateTransactionDraft(this.state.draft), this.randomId); }
    catch (e) { this.change({ operation: 'error', writeMessage: e instanceof Error ? e.message : 'Confira os campos.' }); return Promise.resolve({ confirmed: false }); }
    this.readRevision++;
    this.change({ intent, operation: 'saving', writeMessage: '', status: this.state.result ? 'ready' : 'idle' });
    const operation = (async (): Promise<SaveResult> => {
      try {
        const transaction = await this.repository.create(intent!);
        if (!this.active(scope)) return { confirmed: false };
        this.change({ intent: null, draft: blank(), writeMessage: 'Despesa confirmada no banco.' });
        const refreshed = await this.load();
        if (!this.active(scope)) return { confirmed: false };
        this.change({ operation: 'idle' });
        if (!refreshed) this.change({ writeMessage: 'Despesa confirmada no banco.' + reloadFailure });
        return { confirmed: true, transaction };
      } catch (e) {
        if (this.active(scope)) {
          const uncertain = e instanceof FinanceError && ['uncertain', 'stale', 'unavailable', 'unauthorized'].includes(e.code);
          this.change({ operation: uncertain ? 'uncertain' : 'error', intent: uncertain ? intent : null, writeMessage: financeMessage(e) });
        }
        return { confirmed: false };
      }
    })();
    this.saving = operation;
    void operation.finally(() => { if (this.saving === operation) this.saving = undefined; });
    return operation;
  }
  async mutate<T>(task: (repository: Repository) => Promise<T>) {
    const scope = this.scope(); if (!scope || this.state.operation === 'saving') throw new FinanceError('unauthorized');
    this.readRevision++; this.change({ operation: 'saving', writeMessage: '', status: this.state.result ? 'ready' : 'idle' });
    try {
      const result = await task(this.repository);
      if (!this.active(scope)) throw new FinanceError('stale');
      this.change({ writeMessage: 'Alteração confirmada no banco.' });
      const refreshed = await this.load();
      if (!refreshed && this.active(scope)) this.change({ writeMessage: 'Alteração confirmada no banco.' + reloadFailure });
      if (!this.active(scope)) throw new FinanceError('stale'); this.change({ operation: 'idle' }); return result;
    } catch (e) { if (this.active(scope)) this.change({ operation: e instanceof FinanceError && e.code === 'uncertain' ? 'uncertain' : 'error', writeMessage: financeMessage(e) }); throw e; }
  }
}
