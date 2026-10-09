import { View, StyleSheet, FlatList, Pressable, Platform, useWindowDimensions } from 'react-native';
import { Text, Button, visual, ErrorFeedback } from '@/components/VisualSystem';
import { useRef, useState } from 'react';
import { createScrollViewport, ScrollViewport } from '@/hooks/useGraphVisibility';
import { OverviewChart } from './OverviewChart';
import { ExpenseCard } from '@/components/ExpenseCard';
import { formatBRL } from '@/domain/money';
import { civilToday, formatCivilMonth, shiftCivilMonth } from '@/domain/dates';
import { transactionCategories } from '@/constants/transactionCategories';
import { hasMonthlyQuery, type MonthlyQuery, type FinanceState } from '@/lib/transactions/controller';
import type { Transaction, TransactionKind } from '@/types/transaction';

function MonthControl({ title, label, disabled, onPress }: { title: string; label: string; disabled: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} style={({ pressed }) => [styles.monthControl, hovered && !disabled && styles.pressed, pressed && styles.selected, disabled && styles.disabled]}>
    <Text style={styles.monthText}>{title}</Text>
  </Pressable>;
}

function queryLabel(query: MonthlyQuery) {
  const category = transactionCategories.find(c => c.id === query.categoryId);
  return `${formatCivilMonth(query.month)} · ${category ? `${category.kind === 'income' ? 'Receita' : 'Despesa'}: ${category.name}` : 'Todas as categorias'}`;
}

export function MonthlyOverview({ state, onLoad, onAccount, onNew, onEdit, onViewTransactions, page = 'combined' }: {
  state: FinanceState; onLoad: (query?: MonthlyQuery) => void; onAccount: () => void;
  onNew: () => void; onEdit: (transaction: Transaction) => void; onViewTransactions?: () => void; page?: 'combined' | 'overview' | 'transactions';
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [chartMode, setChartMode] = useState<'weekly' | 'category'>('weekly');
  const [chartKind, setChartKind] = useState<TransactionKind>('expense');
  const [viewport] = useState(createScrollViewport);
  const viewportRef = useRef<View>(null);
  const { width } = useWindowDimensions();
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
  const selectMonth = (month: string) => onLoad({ ...state.query, month });
  return <ScrollViewport.Provider value={viewport}><View ref={viewportRef} style={styles.container} collapsable={false} onLayout={() => {
    if (Platform.OS !== 'web') viewportRef.current?.measureInWindow((x, y, width, height) => { viewport.bounds = { x, y, width, height }; viewport.notify(); });
  }}><FlatList style={styles.container} contentContainerStyle={styles.content} data={page === 'overview' ? [] : expenses}
    scrollEventThrottle={32} onScroll={Platform.OS !== 'web' ? () => viewport.notify() : undefined}
    keyExtractor={item => item.id} renderItem={({ item }) =>
      <Pressable accessibilityRole="button" onPress={() => onEdit(item)} accessibilityLabel={`Editar lançamento: ${item.description}. ${item.kind === 'income' ? 'Receita' : 'Despesa'}, ${formatBRL(item.amountCents)}, ${transactionCategories.find(category => category.id === item.categoryId)?.name}, ${item.occurredOn}`}><ExpenseCard expense={item} /></Pressable>}
    ListHeaderComponent={<View style={styles.controls}>
      <View style={styles.topbar}><Text accessibilityLabel="Ez Finance" style={styles.logo}>EZ$</Text>{page === 'combined' && <Button title="Minha conta" onPress={onAccount} />}</View>
      <Text accessibilityRole="header" style={styles.heading}>{page === 'transactions' ? 'Seus lançamentos' : 'Seu resumo mensal'}</Text>
      <Text accessibilityLiveRegion="polite" style={styles.period}>Seleção: {queryLabel(state.query)}</Text>
      <View style={styles.monthActions}>
        <MonthControl title="Anterior" label="Mês anterior" disabled={locked || !previous} onPress={() => previous && selectMonth(previous)} />
        <MonthControl title="Atual" label="Mês atual" disabled={locked || state.query.month === currentMonth} onPress={() => selectMonth(civilToday().slice(0, 7))} />
        <MonthControl title="Próximo" label="Próximo mês" disabled={locked || !next} onPress={() => next && selectMonth(next)} />
      </View>
      {state.status === 'loading' && <Text accessibilityLiveRegion="polite">Carregando lançamentos…</Text>}
      {!!state.readError && <View style={styles.controls}><ErrorFeedback>{state.readError}</ErrorFeedback>
        {result && <Text>Os dados abaixo são da última consulta confirmada e podem estar desatualizados. A seleção solicitada não foi confirmada.</Text>}
        <Button title="Tentar carregar novamente" disabled={locked} onPress={() => onLoad()} /></View>}
      {!!state.writeMessage && (state.operation === 'error' || state.operation === 'uncertain' || !!state.readError ? <ErrorFeedback>{state.writeMessage}</ErrorFeedback> : <Text accessibilityLiveRegion="polite">{state.writeMessage}</Text>)}
      {page !== 'transactions' && result && state.confirmedQuery && <View style={styles.total}>
        <Text style={styles.label}>Saldo do período</Text>
        <Text style={[styles.value, width < 400 && formatBRL(result.totals.balanceCents).length > 12 && styles.compactValue]}>{formatBRL(result.totals.balanceCents)}</Text>
        {state.readError ? <Text style={styles.period}>Resultado: {queryLabel(state.confirmedQuery)}</Text> : null}
        <View style={styles.indicators}><View style={styles.indicator}><Text style={styles.secondary}>Receitas</Text><Text style={styles.indicatorValue}>{formatBRL(result.totals.incomeCents)}</Text></View>
          <View style={styles.indicator}><Text style={styles.secondary}>Despesas</Text><Text style={styles.indicatorValue}>{formatBRL(result.totals.expenseCents)}</Text></View></View>
        <Text style={styles.note}>Receitas menos despesas desta consulta.</Text>
        <Button title="Novo lançamento" primary disabled={locked} onPress={onNew} />
      </View>}
      {(!result || page === 'transactions') && <Button title="Novo lançamento" primary disabled={locked} onPress={onNew} />}
      {page === 'transactions' && result && state.confirmedQuery && <Text>Resultado: {queryLabel(state.confirmedQuery)}</Text>}
      <Pressable accessibilityRole="button" aria-expanded={filtersOpen} accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={styles.filterToggle}>
        <Text style={styles.label}>{filtersOpen ? 'Ocultar categorias' : 'Filtrar por categoria'} {filtersOpen ? '−' : '+'}</Text>
        <Text style={styles.note}>{transactionCategories.find(category => category.id === state.query.categoryId)?.name ?? 'Todas as categorias'}</Text>
      </Pressable>
      {filtersOpen && <View style={styles.categories}>
        {[{ id: '', name: 'Todas as categorias', kind: null }, ...transactionCategories].map(category => {
          const selected = (state.query.categoryId ?? '') === category.id;
          return <Pressable key={category.id} accessibilityRole="button" aria-pressed={selected} accessibilityState={{ selected, disabled: locked }}
            disabled={locked} onPress={() => { if (category.kind) setChartKind(category.kind); onLoad({ month: state.query.month, categoryId: category.id || undefined }); }}
            style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, locked && styles.disabled]}>
            <Text>{category.kind ? `${category.kind === 'income' ? 'Receita' : 'Despesa'}: ` : ''}{category.name}{selected ? ' (selecionada)' : ''}</Text>
          </Pressable>;
        })}
      </View>}
      {state.query.categoryId && (!result || state.query.categoryId !== state.confirmedQuery?.categoryId || state.query.month !== state.confirmedQuery?.month)
        ? <Button title="Limpar seleção solicitada" disabled={locked} onPress={() => onLoad({ month: state.query.month })} /> : null}
      {page !== 'transactions' && result && state.confirmedQuery && <OverviewChart transactions={result.transactions} month={state.confirmedQuery.month} categoryId={state.confirmedQuery.categoryId}
        mode={chartMode} onModeChange={setChartMode} kind={chartKind} onKindChange={setChartKind} disabled={locked}
        onCategorySelect={categoryId => {
          const category = transactionCategories.find(item => item.id === categoryId);
          if (category) setChartKind(category.kind);
          onLoad({ month: state.confirmedQuery!.month, categoryId });
        }} onClearFilter={() => onLoad({ month: state.confirmedQuery!.month })} />}
      {page !== 'overview' && <View style={styles.listHeading}><View>{page === 'combined' && <Text accessibilityRole="header" style={styles.listTitle}>Seus lançamentos</Text>}
        {result && <Text style={styles.note}>{expenses.length} {expenses.length === 1 ? 'lançamento nesta consulta' : 'lançamentos nesta consulta'}</Text>}</View>
        <Button title="Atualizar lançamentos" disabled={locked || state.status === 'loading'} onPress={() => onLoad()} /></View>}
      {page === 'overview' && onViewTransactions && <Button title="Ver lançamentos desta consulta" onPress={onViewTransactions} />}
    </View>}
    ListEmptyComponent={result && page !== 'overview' ? <View style={styles.empty}><Text>{state.confirmedQuery?.categoryId ? 'Nenhum lançamento para este filtro.' : 'Nenhum lançamento neste mês.'}</Text>
      <Text style={styles.note}>Registre uma entrada ou saída para começar seu resumo.</Text></View> : null} /></View></ScrollViewport.Provider>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: visual.page }, content: { padding: 20, paddingBottom: 40, width: '100%', maxWidth: 960, alignSelf: 'center' },
  controls: { gap: 12, marginBottom: 16 }, heading: { fontSize: 24, lineHeight: 32, fontWeight: '700' }, label: { fontSize: 16, fontWeight: '600' },
  monthActions: { flexDirection: 'row', gap: 8 }, monthControl: { flex: 1, minHeight: 44, minWidth: 0, padding: 8, borderRadius: visual.radius, borderWidth: 1, borderColor: visual.border, backgroundColor: visual.control, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 14, lineHeight: 22, fontWeight: '600' }, categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 44, padding: 12, borderWidth: 1, borderColor: visual.border, borderRadius: visual.radius, backgroundColor: visual.control, justifyContent: 'center', maxWidth: '100%' },
  selected: { backgroundColor: visual.selected, borderColor: visual.muted }, pressed: { backgroundColor: visual.hover }, disabled: { opacity: 0.5 },
  total: { gap: 8, padding: 20, backgroundColor: visual.control, borderRadius: 28 },
  indicators: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }, indicator: { flexGrow: 1, flexBasis: 128, minWidth: 0 }, secondary: { color: visual.text, fontSize: 13, lineHeight: 20 }, indicatorValue: { fontWeight: '600', fontSize: 20, lineHeight: 28, fontVariant: ['tabular-nums'] },
  value: { fontSize: 36, lineHeight: 48, fontWeight: '700', fontVariant: ['tabular-nums'] },
  compactValue: { fontSize: 24, lineHeight: 32 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, logo: { fontSize: 28, lineHeight: 36, fontWeight: '700', color: visual.logo },
  period: { fontSize: 14, lineHeight: 22 }, note: { fontSize: 13, lineHeight: 20 },
  filterToggle: { minHeight: 48, backgroundColor: visual.surface, padding: 16, borderRadius: 16, gap: 4 },
  listHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8 }, listTitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' }, empty: { backgroundColor: visual.surface, borderRadius: 20, padding: 24, gap: 8 },
});
