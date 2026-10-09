import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Text, visual, useTypography, ErrorFeedback } from '@/components/VisualSystem';
import { router, useFocusEffect, useIsFocused, useNavigation } from 'expo-router';
import { usePreventRemove, type NavigationAction } from 'expo-router/react-navigation';
import { useExpenses } from '@/contexts/ExpensesContext';
import { useAuth } from '@/contexts/AuthContext';
import { draftChanged, type FormField } from '@/lib/transactions/form';
import { FinancialConfirmation } from './FinancialConfirmation';

type Decision = { kind: 'leave'; token: string; action: () => void } | { kind: 'delete'; token: string };
export function TransactionForm({ id }: { id?: string }) {
  const { ready: fontReady } = useTypography();
  const inputStyle = [styles.input, fontReady && { fontFamily: 'ManropeRegular' }];
  const { state: financial, finance, form, formState: state } = useExpenses();
  const { auth } = useAuth(); const navigation = useNavigation(); const focused = useIsFocused();
  const [decision, setDecision] = useState<Decision | null>(null);
  const fields = useRef<Partial<Record<FormField, TextInput | null>>>({});
  const key = id ? `edit:${id}` : 'create';
  useFocusEffect(useCallback(() => {
    if (id) void form.beginEdit(id); else form.beginCreate();
    return () => form.closeClean(key);
  }, [form, id, key]));
  const matched = state.authorized && state.key === key;
  const dirty = state.phase !== 'empty' && state.phase !== 'complete' && draftChanged(state.draft, state.initial);
  const warn = dirty || !!state.pending || state.phase === 'working';
  const currentToken = `${state.version}:${state.owner}:${state.key}`;
  const decisionActive = !!decision && state.authorized && decision.token === currentToken;
  const working = state.phase === 'working'; const locked = working || !!state.pending || !matched;
  const askLeave = useCallback((action: () => void) => {
    if (!form.getSnapshot().authorized || form.getSnapshot().phase === 'working') return;
    if (form.warnOnExit()) setDecision(old => old ?? { kind: 'leave', action, token: form.token() });
    else { form.abandon(); action(); }
  }, [form]);
  usePreventRemove(focused && matched && warn, ({ data }: { data: { action: NavigationAction } }) => {
    if (form.getSnapshot().phase === 'working') return;
    const action = data.action; askLeave(() => navigation.dispatch(action));
  });
  useEffect(() => {
    if (Platform.OS !== 'web' || !focused || !matched || !warn) return;
    const anchorUrl = window.location.href;
    const anchorState = window.history.state;
    const onPop = (event: PopStateEvent) => {
      // Expo's web linking resets the root for popstate, bypassing the nested
      // beforeRemove listener. Keep the mounted form until the user decides.
      if (!form.getSnapshot().authorized || !form.warnOnExit()) return;
      event.stopImmediatePropagation();
      window.history.pushState(anchorState, '', anchorUrl);
      if (form.getSnapshot().phase !== 'working') askLeave(() => window.history.back());
    };
    window.addEventListener('popstate', onPop, true);
    return () => window.removeEventListener('popstate', onPop, true);
  }, [focused, matched, warn, form, askLeave, key]);
  useEffect(() => {
    if (decision && !form.active(decision.token)) setDecision(null);
  }, [decision, form, currentToken, state.authorized]);
  useEffect(() => {
    const first = (['description', 'amountText', 'categoryId', 'occurredOn'] as FormField[]).find(field => state.errors[field]);
    if (first) fields.current[first]?.focus();
  }, [state.errors]);
  const save = async () => { if (await form.save()) router.replace('/'); };
  const remove = async (token: string) => { if (await form.remove(token)) router.replace('/'); };
  const confirm = () => {
    const chosen = decision; setDecision(null);
    if (!chosen || !form.active(chosen.token)) return;
    if (chosen.kind === 'delete') void remove(chosen.token);
    else if (form.abandon(chosen.token)) chosen.action();
  };
  const cancel = () => { setDecision(null); fields.current.description?.focus(); };
  const draft = state.draft;
  const ready = matched && ['ready', 'working', 'uncertain', 'complete'].includes(state.phase) && (state.mode === 'create' || !!state.baseline);
  return <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text accessibilityRole="header" style={styles.title}>{id ? 'Editar lançamento' : 'Novo lançamento'}</Text>
    {!ready ? <>
      {state.phase === 'loading' || !matched ? <Text accessibilityLiveRegion="polite">Carregando lançamento…</Text> : <ErrorFeedback>{state.message}</ErrorFeedback>}
      {matched && state.phase === 'error' && <Button title="Tentar carregar lançamento" onPress={() => void form.beginEdit(id!, true)} />}
      <Button title="Voltar à lista" onPress={() => askLeave(() => router.replace('/transactions'))} />
    </> : <>
      <View style={styles.types}>{(['expense', 'income'] as const).map(kind => <Pressable key={kind} accessibilityRole="radio"
        aria-checked={draft.kind === kind} accessibilityState={{ checked: draft.kind === kind, disabled: locked }} disabled={locked} onPress={() => form.setDraft({ kind })}
        style={[styles.choice, draft.kind === kind && styles.selected]}><Text>{kind === 'expense' ? 'Despesa' : 'Receita'}{draft.kind === kind ? ' (selecionada)' : ''}</Text></Pressable>)}</View>
      <Text style={styles.label}>Descrição</Text>
      <TextInput ref={ref => { fields.current.description = ref; }} accessibilityLabel="Descrição" autoComplete="off" multiline value={draft.description}
        editable={!locked} style={inputStyle} onChangeText={description => form.setDraft({ description })} />
      {!!state.errors.description && <ErrorFeedback>{state.errors.description}</ErrorFeedback>}
      <Text style={styles.label}>Valor em reais</Text>
      <TextInput ref={ref => { fields.current.amountText = ref; }} accessibilityLabel="Valor em reais" autoComplete="off" keyboardType="decimal-pad"
        value={draft.amountText} editable={!locked} style={inputStyle} onChangeText={amountText => form.setDraft({ amountText })} />
      {!!state.errors.amountText && <ErrorFeedback>{state.errors.amountText}</ErrorFeedback>}
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categories}>{financial.categories.filter(c => c.kind === draft.kind).map(category => <Pressable key={category.id} accessibilityRole="radio"
        aria-checked={draft.categoryId === category.id} accessibilityState={{ checked: draft.categoryId === category.id, disabled: locked }} disabled={locked}
        style={[styles.choice, draft.categoryId === category.id && styles.selected]} onPress={() => form.setDraft({ categoryId: category.id })}><Text>{category.name}{draft.categoryId === category.id ? ' (selecionada)' : ''}</Text></Pressable>)}</View>
      {!!state.errors.categoryId && <ErrorFeedback>{state.errors.categoryId}</ErrorFeedback>}
      {!financial.categories.length && <Button title="Carregar categorias" onPress={() => void finance.load()} />}
      <Text style={styles.label}>Data efetiva</Text>
      <Text>Use AAAA-MM-DD. O valor inicial de um novo lançamento é hoje; somente hoje ou datas passadas.</Text>
      <TextInput ref={ref => { fields.current.occurredOn = ref; }} accessibilityLabel="Data efetiva" autoComplete="off" value={draft.occurredOn}
        editable={!locked} style={inputStyle} onChangeText={occurredOn => form.setDraft({ occurredOn })} />
      {!!state.errors.occurredOn && <ErrorFeedback>{state.errors.occurredOn}</ErrorFeedback>}
      {!!state.message && <ErrorFeedback>{state.message}</ErrorFeedback>}
      {!!financial.readError && <ErrorFeedback>{financial.readError}</ErrorFeedback>}
      {state.pending && !working && <Text>Campos preservados e bloqueados. A operação pode já estar no banco; verifique antes de repetir ou sair.</Text>}
      {state.pending?.kind === 'delete' ? <Button title="Verificar e tentar exclusão" onPress={() => void remove(form.token())} disabled={working} />
        : <Button title={working ? 'Confirmando gravação…' : state.pending ? 'Verificar e tentar novamente' : 'Salvar lançamento'}
          disabled={working || !financial.categories.length || (state.mode === 'edit' && !dirty && !state.pending)} onPress={() => void save()} />}
      <Button title="Cancelar e voltar à lista" disabled={working} onPress={() => askLeave(() => router.replace('/transactions'))} />
      <Button title="Minha conta" disabled={working} onPress={() => askLeave(() => router.push('/auth/account'))} />
      <Button title="Sair deste dispositivo" disabled={working} onPress={() => askLeave(() => { void auth.logout(); })} />
      {state.baseline && !state.pending && <Pressable accessibilityRole="button" disabled={working} style={styles.delete}
        onPress={() => setDecision({ kind: 'delete', token: form.token() })}><Text style={styles.error}>Excluir lançamento</Text></Pressable>}
    </>}
    <FinancialConfirmation visible={decisionActive} title={decision?.kind === 'delete' ? 'Excluir lançamento?' : 'Sair sem salvar?'}
      message={decision?.kind === 'delete' ? `Excluir “${state.baseline?.description}” do histórico?${dirty ? ' As alterações não salvas deste formulário também serão descartadas após a exclusão confirmada.' : ''}`
        : state.pending ? 'A operação pode já estar no banco. Sair abandona esta tentativa; confira o histórico antes de cadastrar ou alterar novamente.' : 'Suas alterações não foram salvas. Descartar não altera o lançamento no banco.'}
      confirmLabel={decision?.kind === 'delete' ? 'Confirmar exclusão' : 'Descartar e sair'} onCancel={cancel} onConfirm={confirm} />
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { backgroundColor: visual.page, padding: 16, gap: 12, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: visual.text }, label: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  input: { backgroundColor: visual.control, borderColor: visual.border, borderWidth: 1, borderRadius: visual.radius, minHeight: visual.controlHeight, padding: 12, fontSize: 16, color: visual.text },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, categories: { gap: 8 }, choice: { padding: 12, minHeight: visual.controlHeight, borderRadius: visual.radius, borderWidth: 1, borderColor: visual.border, backgroundColor: visual.control },
  selected: { borderColor: visual.muted, backgroundColor: visual.selected }, error: { color: visual.danger }, delete: { minHeight: visual.controlHeight, padding: 12, marginTop: 12, borderWidth: 1, borderColor: visual.danger, borderRadius: visual.radius, alignItems: 'center' } });
