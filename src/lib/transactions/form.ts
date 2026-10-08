import { civilToday, validateOccurredOn } from '../../domain/dates';
import { parseAmountCents } from '../../domain/money';
import { validateTransactionDraft } from '../../domain/transactions';
import { transactionCategories } from '../../constants/transactionCategories';
import type { Transaction, TransactionDraft, TransactionInput, TransactionKind } from '../../types/transaction';
import { FinanceError, financeMessage } from './errors';
import { createIntent, type CreateIntent, type TransactionRepository } from './repository';

export type FormMutation = { kind: 'create'; intent: CreateIntent } | { kind: 'update'; id: string; input: TransactionInput } | { kind: 'delete'; id: string };
export type FormField = keyof TransactionDraft;
export type FormState = {
  version: number; owner: string | null; authorized: boolean; key: string; mode: 'create' | 'edit'; id: string | null;
  phase: 'empty' | 'loading' | 'ready' | 'error' | 'missing' | 'working' | 'uncertain' | 'complete';
  draft: TransactionDraft; initial: TransactionDraft; baseline: Transaction | null;
  pending: FormMutation | null; message: string; errors: Partial<Record<FormField, string>>;
};
const blank = (kind: TransactionKind = 'expense'): TransactionDraft => ({ kind, description: '', amountText: '', categoryId: '', occurredOn: civilToday() });
const fromTransaction = (row: Transaction): TransactionDraft => ({ kind: row.kind, description: row.description,
  amountText: `${Math.floor(row.amountCents / 100)},${String(row.amountCents % 100).padStart(2, '0')}`,
  categoryId: row.categoryId, occurredOn: row.occurredOn });
function amountKey(value: string) { try { return parseAmountCents(value); } catch { return value; } }
export function draftChanged(a: TransactionDraft, b: TransactionDraft) {
  return a.kind !== b.kind || a.description !== b.description || amountKey(a.amountText) !== amountKey(b.amountText)
    || a.categoryId !== b.categoryId || a.occurredOn !== b.occurredOn;
}
export function formErrors(draft: TransactionDraft): FormState['errors'] {
  const errors: FormState['errors'] = {};
  if (!draft.description.trim()) errors.description = 'Informe uma descrição.';
  try { parseAmountCents(draft.amountText); } catch (e) { errors.amountText = e instanceof Error ? e.message : 'Confira o valor.'; }
  if (!transactionCategories.some(c => c.kind === draft.kind && c.id === draft.categoryId)) errors.categoryId = 'Escolha uma categoria deste tipo.';
  try { validateOccurredOn(draft.occurredOn ?? ''); } catch (e) { errors.occurredOn = e instanceof Error ? e.message : 'Confira a data.'; }
  return errors;
}

// One in-memory form, keyed by validated owner + mode/ID. No draft storage.
export class TransactionFormController {
  private revision = 0; private readRevision = 0; private listeners = new Set<() => void>();
  private flight?: Promise<boolean>; private state: FormState = this.empty();
  constructor(private reader: Pick<TransactionRepository, 'get'>,
    private write: (operation: FormMutation) => Promise<Transaction | { id: string; confirmed: true; reconciled: boolean }>,
    private randomId: () => string) {}
  private empty(): FormState { const draft = blank(); return { version: this.revision, owner: null, authorized: false, key: '', mode: 'create', id: null,
    phase: 'empty', draft, initial: { ...draft }, baseline: null, pending: null, message: '', errors: {} }; }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private change(patch: Partial<FormState>) { this.state = { ...this.state, ...patch, version: this.revision }; this.listeners.forEach(fn => fn()); }
  token() { return `${this.revision}:${this.state.owner}:${this.state.key}`; }
  active(token: string) { return this.state.authorized && this.token() === token; }
  dirty() { return this.state.phase !== 'complete' && this.state.phase !== 'empty' && draftChanged(this.state.draft, this.state.initial); }
  warnOnExit() { return this.dirty() || !!this.state.pending || this.state.phase === 'working'; }
  bind(status: string, owner?: string) {
    if (status === 'signedOut' || status === 'recovery' || (status === 'authenticated' && owner !== this.state.owner)) {
      this.revision++; this.readRevision++; this.flight = undefined; this.state = this.empty();
      this.change(status === 'authenticated' && owner ? { owner, authorized: true } : {}); return;
    }
    if (status !== 'authenticated') {
      if (this.state.authorized) {
        this.revision++; this.readRevision++; this.flight = undefined;
        const interruptedRead = this.state.phase === 'loading';
        this.change({ authorized: false, phase: this.state.pending ? 'uncertain' : interruptedRead ? 'error' : this.state.phase,
          message: interruptedRead ? financeMessage(new FinanceError('unavailable')) : this.state.message });
      }
    } else if (!this.state.authorized) { this.revision++; this.change({ authorized: true }); }
  }
  beginCreate(kind: TransactionKind = 'expense') {
    if (!this.state.authorized) return;
    if (this.state.key === 'create' && this.state.phase !== 'empty' && this.state.phase !== 'complete') return;
    this.revision++; this.readRevision++; const draft = blank(kind);
    this.change({ key: 'create', mode: 'create', id: null, phase: 'ready', draft, initial: { ...draft }, baseline: null, pending: null, message: '', errors: {} });
  }
  async beginEdit(id: string, retry = false): Promise<void> {
    if (!this.state.authorized) return;
    const key = `edit:${id}`;
    if (this.state.key === key && (this.state.baseline || this.state.pending || this.state.phase === 'loading') && !retry) return;
    if (this.state.key === key && (this.dirty() || this.state.pending || this.state.phase === 'working')) return;
    this.revision++; const read = ++this.readRevision;
    this.change({ key, mode: 'edit', id, phase: 'loading', baseline: null, pending: null, message: '', errors: {} });
    const token = this.token();
    try {
      const row = await this.reader.get(id);
      if (!this.active(token) || read !== this.readRevision) return;
      if (!row) { this.change({ phase: 'missing', message: 'Lançamento ausente ou indisponível para esta conta.' }); return; }
      if (row.userId !== this.state.owner) throw new FinanceError('unauthorized');
      const draft = fromTransaction(row); this.change({ draft, initial: { ...draft }, baseline: row, phase: 'ready' });
    } catch (e) { if (this.active(token) && read === this.readRevision) this.change({ phase: 'error', message: financeMessage(e) }); }
  }
  setDraft(patch: Partial<TransactionDraft>) {
    if (!this.state.authorized || this.state.phase !== 'ready' || this.state.pending) return false;
    const draft = { ...this.state.draft, ...patch };
    if (patch.kind && patch.kind !== this.state.draft.kind) draft.categoryId = '';
    this.change({ draft, errors: {}, message: '' }); return true;
  }
  abandon(token = this.token()) {
    if (!this.active(token) || this.state.phase === 'working') return false;
    this.revision++; this.readRevision++; const { owner, authorized } = this.state;
    this.state = this.empty(); this.change({ owner, authorized }); return true;
  }
  closeClean(key: string) { if (this.state.key === key && !this.warnOnExit()) this.abandon(); }
  save(): Promise<boolean> {
    if (this.flight) return this.state.pending?.kind === 'delete' ? Promise.resolve(false) : this.flight;
    if (!this.state.authorized || !['ready', 'uncertain'].includes(this.state.phase) || this.state.pending?.kind === 'delete') return Promise.resolve(false);
    let operation = this.state.pending;
    if (!operation) {
      const errors = formErrors(this.state.draft);
      if (Object.keys(errors).length) { this.change({ errors, message: 'Confira os campos indicados.' }); return Promise.resolve(false); }
      if (this.state.mode === 'edit' && !this.dirty()) return Promise.resolve(false);
      const input = validateTransactionDraft(this.state.draft);
      operation = this.state.mode === 'create' ? { kind: 'create', intent: createIntent(input, this.randomId) }
        : { kind: 'update', id: this.state.id!, input: Object.freeze(input) };
    }
    return this.perform(operation);
  }
  remove(token: string): Promise<boolean> {
    if (this.flight) return this.state.pending?.kind === 'delete' ? this.flight : Promise.resolve(false);
    if (!this.active(token) || !this.state.baseline || !['ready', 'uncertain'].includes(this.state.phase) || (this.state.pending && this.state.pending.kind !== 'delete')) return Promise.resolve(false);
    return this.perform(this.state.pending ?? { kind: 'delete', id: this.state.baseline.id });
  }
  private perform(operation: FormMutation): Promise<boolean> {
    const token = this.token(); this.change({ pending: operation, phase: 'working', errors: {}, message: '' });
    const flight = (async () => {
      try {
        const result = await this.write(operation);
        if (!this.active(token)) return false;
        if (operation.kind !== 'delete') {
          const row = result as Transaction;
          if (row.userId !== this.state.owner || (this.state.mode === 'edit' && (row.id !== this.state.id || row.createdAt !== this.state.baseline?.createdAt))) throw new FinanceError('uncertain');
          const draft = fromTransaction(row); this.change({ baseline: row, draft, initial: { ...draft } });
        }
        this.change({ pending: null, phase: 'complete', message: operation.kind === 'delete' ? 'Exclusão confirmada.' : 'Lançamento confirmado.' }); return true;
      } catch (e) {
        if (this.active(token)) {
          // A conflicting UUID may represent a committed row changed elsewhere.
          // Retain the intent; never silently replace its ID on the next save.
          const unknown = e instanceof FinanceError && ['uncertain', 'unavailable', 'unauthorized', 'stale', 'conflict'].includes(e.code);
          this.change({ pending: unknown ? operation : null, phase: unknown ? 'uncertain' : 'ready', message: financeMessage(e) });
        }
        return false;
      }
    })();
    this.flight = flight; void flight.finally(() => { if (this.flight === flight) this.flight = undefined; }); return flight;
  }
}
