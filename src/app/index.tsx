import { View, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { Text, Button, visual, ErrorFeedback } from '@/components/VisualSystem';
import { Link } from 'expo-router';
import { useExpenses } from '@/contexts/ExpensesContext';
import { ExpenseCard } from '@/components/ExpenseCard';
import { formatBRL } from '@/domain/money';
import { civilToday, formatCivilMonth, shiftCivilMonth } from '@/domain/dates';
import { transactionCategories } from '@/constants/transactionCategories';
import { hasMonthlyQuery, type MonthlyQuery } from '@/lib/transactions/controller';

function queryLabel(query: MonthlyQuery) {
  const category = transactionCategories.find(c => c.id === query.categoryId);
  return `${formatCivilMonth(query.month)} · ${category ? `${category.kind === 'income' ? 'Receita' : 'Despesa'}: ${category.name}` : 'Todas as categorias'}`;
}

export default function Home() {
  const { state, finance } = useExpenses();
  if (!hasMonthlyQuery(state)) return <View style={[styles.content, styles.controls]}>
    <Text accessibilityRole="alert">A aplicação foi atualizada. Recarregue para abrir a consulta mensal.</Text>
    <Text>Se houver alterações não salvas, o navegador pedirá confirmação antes de sair.</Text>
    {Platform.OS === 'web' && <Button title="Recarregar aplicativo" onPress={() => window.location.reload()} />}
  </View>;
  const currentMonth = civilToday().slice(0, 7);
  const previous = shiftCivilMonth(state.query.month, -1), next = shiftCivilMonth(state.query.month, 1);
  const locked = !state.authorized || state.operation === 'saving';
  // During transitions keep the last complete snapshot in the controller only.
  // On failure present it explicitly under its confirmed context.
  const result = state.status === 'loading' ? null : state.result;
  const expenses = result?.transactions ?? [];
  const selectMonth = (month: string) => { void finance.load({ ...state.query, month }); };
  return <FlatList style={styles.container} contentContainerStyle={styles.content} data={expenses}
    keyExtractor={item => item.id} renderItem={({ item }) => <Link href={{ pathname: '/expenses/[id]', params: { id: item.id } }} asChild>
      <Pressable accessibilityLabel={`Editar lançamento: ${item.description}. ${item.kind === 'income' ? 'Receita' : 'Despesa'}, ${formatBRL(item.amountCents)}, ${transactionCategories.find(category => category.id === item.categoryId)?.name}, ${item.occurredOn}`}><ExpenseCard expense={item} /></Pressable></Link>}
    ListHeaderComponent={<View style={styles.controls}>
      <Link href="/auth/account" style={styles.accountLink}>Minha conta e sair</Link>
      <Text accessibilityRole="header" style={styles.heading}>Consulta mensal</Text>
      <Text accessibilityLiveRegion="polite">Seleção: {queryLabel(state.query)}</Text>
      <View style={styles.monthActions}>
        <Button title="Mês anterior" disabled={locked || !previous} onPress={() => previous && selectMonth(previous)} />
        <Button title="Próximo mês" disabled={locked || !next} onPress={() => next && selectMonth(next)} />
        <Button title="Mês atual" disabled={locked || state.query.month === currentMonth} onPress={() => selectMonth(civilToday().slice(0, 7))} />
      </View>
      {state.status === 'loading' && <Text accessibilityLiveRegion="polite">Carregando lançamentos…</Text>}
      {!!state.readError && <View style={styles.controls}><ErrorFeedback>{state.readError}</ErrorFeedback>
        {result && <Text>Os dados abaixo são da última consulta confirmada e podem estar desatualizados. A seleção solicitada não foi confirmada.</Text>}
        <Button title="Tentar carregar novamente" disabled={locked} onPress={() => void finance.load()} /></View>}
      {!!state.writeMessage && (state.operation === 'error' || state.operation === 'uncertain' || !!state.readError ? <ErrorFeedback>{state.writeMessage}</ErrorFeedback> : <Text accessibilityLiveRegion="polite">{state.writeMessage}</Text>)}
      {result && state.confirmedQuery && <View style={styles.total}>
        <Text style={styles.label}>Resultado: {queryLabel(state.confirmedQuery)}</Text>
        <Text>Lançamentos: {expenses.length}</Text>
        <View style={styles.indicators}><View style={styles.indicator}><Text style={styles.secondary}>Receitas</Text><Text style={styles.indicatorValue}>{formatBRL(result.totals.incomeCents)}</Text></View>
          <View style={styles.indicator}><Text style={styles.secondary}>Despesas</Text><Text style={styles.indicatorValue}>{formatBRL(result.totals.expenseCents)}</Text></View></View>
        <Text style={styles.value}>Saldo: {formatBRL(result.totals.balanceCents)}</Text>
      </View>}
      <Text style={styles.label}>Filtrar por categoria</Text>
      <View style={styles.categories}>
        {[{ id: '', name: 'Todas as categorias', kind: null }, ...transactionCategories].map(category => {
          const selected = (state.query.categoryId ?? '') === category.id;
          return <Pressable key={category.id} accessibilityRole="button" aria-pressed={selected} accessibilityState={{ selected, disabled: locked }}
            disabled={locked} onPress={() => void finance.load({ month: state.query.month, categoryId: category.id || undefined })}
            style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, locked && styles.disabled]}>
            <Text>{category.kind ? `${category.kind === 'income' ? 'Receita' : 'Despesa'}: ` : ''}{category.name}{selected ? ' (selecionada)' : ''}</Text>
          </Pressable>;
        })}
      </View>
      <Button title="Atualizar lançamentos" disabled={locked || state.status === 'loading'} onPress={() => void finance.load()} />

    </View>}
    ListEmptyComponent={result ? <Text>{state.confirmedQuery?.categoryId ? 'Nenhum lançamento para este filtro.' : 'Nenhum lançamento neste mês.'}</Text> : null}
    ListFooterComponent={<View style={styles.controls}><Link href="/expenses/new" style={styles.link}>Novo lançamento</Link></View>} />;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: visual.page }, content: { padding: 16, width: '100%', maxWidth: 960, alignSelf: 'center' },
  controls: { gap: 16, marginBottom: 16 }, heading: { fontSize: 28, lineHeight: 36, fontWeight: '700' }, label: { fontSize: 16, fontWeight: '600' },
  monthActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 44, padding: 12, borderWidth: 1, borderColor: visual.border, borderRadius: visual.radius, backgroundColor: visual.control, justifyContent: 'center', maxWidth: '100%' },
  selected: { backgroundColor: visual.selected, borderColor: visual.muted }, pressed: { backgroundColor: visual.hover }, disabled: { opacity: 0.5 },
  total: { gap: 8, padding: 24, backgroundColor: visual.surface, borderWidth: 1, borderColor: visual.separator, borderRadius: 20 },
  indicators: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }, indicator: { flexGrow: 1, flexBasis: 180, minWidth: 0 }, secondary: { color: visual.muted, fontSize: 13, lineHeight: 20 }, indicatorValue: { fontWeight: '600', fontSize: 20, lineHeight: 28 },
  value: { fontSize: 32, lineHeight: 44, fontWeight: '700', marginTop: 8 }, accountLink: { fontFamily: 'ManropeSemiBold', fontSize: 14, lineHeight: 22, color: visual.text, paddingVertical: 12 }, link: { padding: 16, color: visual.text, fontFamily: 'ManropeSemiBold', fontSize: 16, lineHeight: 24, backgroundColor: visual.control, borderRadius: visual.radius, textAlign: 'center' } });
