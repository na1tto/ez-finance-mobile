import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { randomAttemptId } from '@/lib/auth/platform';
import { FinanceController, type FinanceState } from '@/lib/transactions/controller';
import { TransactionRepository } from '@/lib/transactions/repository';
import { draftChanged, TransactionFormController, type FormState } from '@/lib/transactions/form';
import type { Transaction } from '@/types/transaction';

const ExpensesContext = createContext<{ state: FinanceState; finance: FinanceController; form: TransactionFormController; formState: FormState } | null>(null);
export function ExpensesProvider({ children }: { children: ReactNode }) {
  const { state: authentication, auth } = useAuth();
  const [{ finance, form }] = useState(() => {
    let controller: FinanceController;
    const repository = new TransactionRepository(getSupabaseClient(), () => {
      const current = auth.getSnapshot(); const scope = controller?.scope();
      return current.status === 'authenticated' && current.session?.user.id === scope?.userId ? scope : null;
    }, () => { void auth.retry(); });
    controller = new FinanceController(repository, randomAttemptId);
    const form = new TransactionFormController(repository, operation => controller.mutate<Transaction | { id: string; confirmed: true; reconciled: boolean }>(repo => {
      if (operation.kind === 'create') return repo.create(operation.intent);
      if (operation.kind === 'update') return repo.update(operation.id, operation.input);
      return repo.delete(operation.id);
    }), randomAttemptId);
    return { finance: controller, form };
  });
  const [state, setState] = useState(finance.getSnapshot());
  const [formState, setFormState] = useState(form.getSnapshot());
  useLayoutEffect(() => finance.subscribe(() => setState(finance.getSnapshot())), [finance]);
  useLayoutEffect(() => form.subscribe(() => setFormState(form.getSnapshot())), [form]);
  const userId = authentication.session?.user.id;
  useLayoutEffect(() => {
    finance.bind(authentication.status, userId);
    form.bind(authentication.status, userId);
    if (authentication.status === 'authenticated') void finance.load();
  }, [finance, form, authentication.status, userId]);
  // Render values must depend on the subscribed snapshot: React Compiler
  // can cache calls on a stable mutable controller with their initial value.
  const warn = (formState.phase !== 'empty' && formState.phase !== 'complete' && draftChanged(formState.draft, formState.initial))
    || !!formState.pending || formState.phase === 'working';
  useEffect(() => {
    if (Platform.OS !== 'web' || !warn) return;
    const onExit = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', onExit);
    return () => window.removeEventListener('beforeunload', onExit);
  }, [warn]);
  // Never expose another owner's collection before the identity effect commits.
  const visible = authentication.status === 'authenticated' && state.authorized && state.owner === userId;
  const masked = visible ? state : { ...state, authorized: false, result: null, categories: [] };
  const formVisible = authentication.status === 'authenticated' && formState.authorized && formState.owner === userId;
  const maskedForm = formVisible ? formState : { ...formState, authorized: false, draft: { ...formState.initial, description: '', amountText: '', categoryId: '' }, baseline: null };
  return <ExpensesContext.Provider value={{ state: masked, finance, form, formState: maskedForm }}>{children}</ExpensesContext.Provider>;
}
export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) throw new Error('useExpenses deve ser utilizado dentro de ExpensesProvider');
  return context;
}
