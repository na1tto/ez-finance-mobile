import { createElement, useEffect, useState } from 'react';
import { Animated, Easing, Platform, View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Text, Button, visual } from './VisualSystem';
import { weeklyActivity, categoryActivity, categoryAtRingPoint } from '@/domain/overview';
import { formatBRL } from '@/domain/money';
import type { Transaction, TransactionKind } from '@/types/transaction';
import { transactionCategories } from '@/constants/transactionCategories';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGraphVisibility } from '@/hooks/useGraphVisibility';

// Local pilot composition. Do not expand these patterns until user validation.
const categoryColors = [visual.text, visual.muted, visual.solid, visual.focus, visual.border, visual.separator];
function useEntrance(reduced: boolean | null, signature: string, nativeDriver: boolean, visible: boolean) {
  const [progress] = useState(() => new Animated.Value(reduced === true ? 1 : 0));
  useEffect(() => {
    progress.stopAnimation();
    if (reduced !== false) { progress.setValue(reduced === true ? 1 : 0); return; }
    progress.setValue(0);
    if (!visible) return;
    const animation = Animated.timing(progress, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [progress, reduced, signature, nativeDriver, visible]);
  return progress;
}
function WeeklyPlot({ weeks, maximum, reduced, selectedWeek, onSelect }: { weeks: ReturnType<typeof weeklyActivity>; maximum: number; reduced: boolean | null;
  selectedWeek: string | null; onSelect: (label: string) => void }) {
  const signature = weeks.map(week => `${week.label}:${week.incomeCents}:${week.expenseCents}`).join('|');
  const visibility = useGraphVisibility();
  const progress = useEntrance(reduced, signature, Platform.OS !== 'web', visibility.visible);
  return <View ref={visibility.ref} onLayout={visibility.onLayout} collapsable={false} style={styles.plot}>{weeks.map(week => <Pressable key={week.label} style={({ pressed }) => [styles.week, selectedWeek === week.label && styles.highlightWeek, pressed && styles.pressed]}
    accessibilityRole="button" aria-pressed={selectedWeek === week.label} accessibilityState={{ selected: selectedWeek === week.label }} onPress={() => onSelect(week.label)}
    accessibilityLabel={`Ver valores dos dias ${week.label}: receitas ${formatBRL(week.incomeCents)}, despesas ${formatBRL(week.expenseCents)}`}>
    <View style={styles.barPair}><Animated.View style={[styles.bar, styles.incomeBar, { height: `${week.incomeCents / maximum * 100}%`, transform: [{ scaleY: progress }] }]} />
      <Animated.View style={[styles.bar, styles.expenseBar, { height: `${week.expenseCents / maximum * 100}%`, transform: [{ scaleY: progress }] }]} /></View>
    <Text style={styles.dayLabel}>{week.label}</Text>
  </Pressable>)}</View>;
}
function CategoryRing({ groups, reduced, disabled, onSelect }: { groups: ReturnType<typeof categoryActivity>['groups']; reduced: boolean | null;
  disabled: boolean; onSelect: (categoryId: string) => void }) {
  const signature = groups.map(group => `${group.id}:${group.amountCents}`).join('|');
  const visibility = useGraphVisibility();
  const animation = useEntrance(reduced, signature, false, visibility.visible);
  const [value, setValue] = useState(reduced === true ? 1 : 0);
  useEffect(() => {
    const listener = animation.addListener(({ value: next }) => setValue(Math.round(next * 40) / 40));
    return () => animation.removeListener(listener);
  }, [animation]);
  const progress = reduced === false ? value : reduced === true ? 1 : 0;
  const circumference = 2 * Math.PI * 76;
  let offset = 0;
  const arcs = groups.map((group, index) => {
    const length = group.fraction * circumference;
    // Reveal consecutive category arcs clockwise from 12 o'clock, not all at once.
    const visible = Math.min(length, Math.max(0, progress * circumference - offset));
    const arc = { color: categoryColors[index], length: visible, offset };
    offset += length;
    return arc;
  });
  if (Platform.OS === 'web') return <View ref={visibility.ref} collapsable={false}>{createElement('svg', { width: 200, height: 200, viewBox: '0 0 200 200', 'aria-hidden': true, focusable: false },
    arcs.map((arc, index) => createElement('circle', { key: groups[index].id, cx: 100, cy: 100, r: 76, fill: 'none', stroke: arc.color,
      strokeWidth: 24, strokeDasharray: `${arc.length} ${circumference}`, strokeDashoffset: -arc.offset, transform: 'rotate(-90 100 100)',
      style: { cursor: disabled ? 'default' : 'pointer' }, onClick: disabled ? undefined : () => onSelect(groups[index].id) })))}</View>;
  const circles = arcs.map(arc => `<circle cx="100" cy="100" r="76" fill="none" stroke="${arc.color}" stroke-width="24" stroke-dasharray="${arc.length} ${circumference}" stroke-dashoffset="${-arc.offset}" transform="rotate(-90 100 100)"/>`).join('');
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${circles}</svg>`)}`;
  return <View ref={visibility.ref} onLayout={visibility.onLayout} collapsable={false}><Pressable accessible={false} disabled={disabled} onPress={event => {
    const { locationX, locationY } = event.nativeEvent;
    const categoryId = categoryAtRingPoint(groups, locationX, locationY, progress);
    if (categoryId) onSelect(categoryId);
  }}><Image source={{ uri }} style={styles.ringImage} cachePolicy="none" transition={0} accessible={false} alt="" /></Pressable></View>;
}
function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" aria-pressed={selected} accessibilityState={{ selected }} onPress={onPress}
    style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed]}>
    <Text style={[styles.choiceText, selected && styles.selectedText]}>{label}</Text>
  </Pressable>;
}

export function OverviewChart({ transactions, month, categoryId, mode, onModeChange, kind, onKindChange, onCategorySelect, onClearFilter, disabled = false }: {
  transactions: readonly Transaction[]; month: string; categoryId?: string; mode: 'weekly' | 'category'; onModeChange: (mode: 'weekly' | 'category') => void;
  kind: TransactionKind; onKindChange: (kind: TransactionKind) => void; onCategorySelect: (categoryId: string) => void; onClearFilter: () => void; disabled?: boolean;
}) {
  const [valuesOpen, setValuesOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const reduced = useReducedMotion();
  // A single-category result already defines the type; never chart hidden data.
  const chartKind = categoryId ? transactions[0]?.kind ?? (categoryId.startsWith('income-') ? 'income' : 'expense') : kind;
  const weeks = weeklyActivity(transactions, month);
  const maximum = Math.max(...weeks.flatMap(week => [week.incomeCents, week.expenseCents]));
  const categories = categoryActivity(transactions, chartKind);
  const selected = weeks.find(week => week.label === selectedWeek);
  const filterName = transactionCategories.find(category => category.id === categoryId)?.name;
  return <View style={styles.section}>
    <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>Seu mês em movimento</Text>
      <Text style={styles.support}>Lançamentos do período e filtro acima</Text></View>
    {categoryId && <View style={styles.filterStatus}><Text style={styles.label}>Filtro: {filterName}</Text><Button title="Limpar filtro" disabled={disabled} onPress={onClearFilter} /></View>}
    <View style={styles.choices}><Choice label="Por semana" selected={mode === 'weekly'} onPress={() => onModeChange('weekly')} />
      <Choice label="Por categoria" selected={mode === 'category'} onPress={() => onModeChange('category')} /></View>
    {mode === 'weekly' ? maximum === 0 ? <Text style={styles.empty}>Ao registrar receitas ou despesas, você verá o movimento do mês aqui.</Text> : <>
      <View style={styles.legend}><Text style={[styles.legendText, styles.incomeLegend]}>Receitas · barras verdes</Text><Text style={[styles.legendText, styles.expenseLegend]}>Despesas · barras escuras</Text></View>
      <Text style={styles.support}>Escala até {formatBRL(maximum)}</Text>
      <WeeklyPlot weeks={weeks} maximum={maximum} reduced={reduced} selectedWeek={selectedWeek} onSelect={setSelectedWeek} />
      <Text style={styles.support}>Dias do mês · intervalos de 7 dias</Text>
      {selected ? <View style={styles.weekDetails} accessibilityLiveRegion="polite"><Text style={styles.label}>Dias {selected.label}</Text>
        <Text style={styles.valueText}>Receitas {formatBRL(selected.incomeCents)}</Text><Text style={styles.valueText}>Despesas {formatBRL(selected.expenseCents)}</Text></View>
        : <Text style={styles.support}>Toque nas barras para ver os valores da semana.</Text>}
      <Pressable accessibilityRole="button" aria-expanded={valuesOpen} accessibilityState={{ expanded: valuesOpen }} onPress={() => setValuesOpen(!valuesOpen)} style={styles.details}>
        <Text style={styles.label}>{valuesOpen ? 'Ocultar valores por semana −' : 'Ver valores por semana +'}</Text>
      </Pressable>
      {valuesOpen && <View style={styles.values}>{weeks.map(week => <View key={week.label} style={styles.valueRow}>
        <Text style={styles.valueLabel}>Dias {week.label}</Text><View style={styles.valueAmounts}>
          <View style={styles.valueColumn}><Text style={styles.support}>Receitas</Text><Text style={styles.valueText}>{formatBRL(week.incomeCents)}</Text></View>
          <View style={styles.valueColumn}><Text style={styles.support}>Despesas</Text><Text style={styles.valueText}>{formatBRL(week.expenseCents)}</Text></View>
        </View></View>)}</View>}
    </> : <>
      {!categoryId && <View style={styles.choices}><Choice label="Despesas" selected={kind === 'expense'} onPress={() => onKindChange('expense')} />
        <Choice label="Receitas" selected={kind === 'income'} onPress={() => onKindChange('income')} /></View>}
      <Text style={styles.support}>Distribuição de {chartKind === 'income' ? 'receitas' : 'despesas'} por categoria</Text>
      {categories.totalCents > 0 && <Text style={styles.support}>Toque no anel ou na categoria para filtrar os lançamentos abaixo.</Text>}
      {categories.totalCents === 0 ? <Text style={styles.empty}>Nenhuma {chartKind === 'income' ? 'receita' : 'despesa'} nesta consulta para representar.</Text> : <View style={styles.categoryLayout}>
        <View style={styles.ring}><CategoryRing groups={categories.groups} reduced={reduced} disabled={disabled} onSelect={onCategorySelect} />
          <View pointerEvents="none" style={styles.ringCenter}><Text style={styles.ringNumber}>{categories.groups.length}</Text><Text style={styles.support}>{categories.groups.length === 1 ? 'categoria' : 'categorias'}</Text></View>
        </View>
        <View style={styles.categoryLegend}><Text style={styles.label}>Total de {chartKind === 'income' ? 'receitas' : 'despesas'}</Text>
          <Text style={styles.total}>{formatBRL(categories.totalCents)}</Text>
          {categories.groups.map((category, index) => <Pressable key={category.id} accessibilityRole="button" disabled={disabled}
            accessibilityLabel={`Filtrar por ${category.name}: ${formatBRL(category.amountCents)}`}
            aria-pressed={category.id === categoryId} accessibilityState={{ selected: category.id === categoryId, disabled }} onPress={() => onCategorySelect(category.id)}
            style={({ pressed }) => [styles.categoryRow, category.id === categoryId && styles.highlightWeek, pressed && styles.pressed, disabled && styles.disabled]}>
            <View style={styles.categoryName}><View style={[styles.swatch, { backgroundColor: categoryColors[index] }]} /><Text style={styles.categoryText}>{category.name}</Text></View>
            <Text style={styles.valueText}>{formatBRL(category.amountCents)} · {(category.fraction * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</Text>
          </Pressable>)}
        </View>
      </View>}
    </>}
  </View>;
}
const styles = StyleSheet.create({
  section: { backgroundColor: visual.surface, borderRadius: 24, padding: 20, gap: 16 }, header: { gap: 4 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '600' }, support: { fontSize: 13, lineHeight: 20 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: visual.control, borderRadius: 24, borderWidth: 1, borderColor: visual.border, justifyContent: 'center' },
  selected: { backgroundColor: visual.text, borderColor: visual.text }, choiceText: { fontSize: 14, fontWeight: '600' }, selectedText: { color: visual.surface }, pressed: { opacity: 0.8 },
  empty: { paddingVertical: 24 }, legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, legendText: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  incomeLegend: { color: visual.muted }, expenseLegend: { color: visual.text },
  details: { minHeight: 44, justifyContent: 'center' },
  filterStatus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  highlightWeek: { backgroundColor: visual.selected }, weekDetails: { backgroundColor: visual.control, borderRadius: 12, padding: 12, gap: 4 }, disabled: { opacity: 0.55 },
  plot: { flexDirection: 'row', gap: 4 }, week: { flex: 1, minWidth: 0, gap: 8, paddingVertical: 4, borderRadius: 8 }, barPair: { height: 128, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, borderBottomWidth: 1, borderColor: visual.border },
  bar: { width: '32%', borderTopLeftRadius: 4, borderTopRightRadius: 4, transformOrigin: 'bottom' }, incomeBar: { backgroundColor: visual.solid }, expenseBar: { backgroundColor: visual.text }, dayLabel: { fontSize: 12, lineHeight: 20, textAlign: 'center' },
  values: { gap: 12 }, valueRow: { gap: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: visual.separator }, valueLabel: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  valueAmounts: { flexDirection: 'row', gap: 12 }, valueColumn: { flex: 1, minWidth: 0, gap: 2 }, valueText: { fontSize: 13, lineHeight: 20, fontVariant: ['tabular-nums'] },
  categoryLayout: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24 }, ring: { width: 200, height: 200 }, ringImage: { width: 200, height: 200 },
  ringCenter: { position: 'absolute', top: 60, left: 40, width: 120, alignItems: 'center' }, ringNumber: { fontSize: 32, lineHeight: 44, fontWeight: '700' },
  categoryLegend: { flexGrow: 1, flexBasis: 240, gap: 12, minWidth: 0, maxWidth: '100%' }, label: { fontSize: 14, fontWeight: '600' }, total: { fontSize: 24, lineHeight: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
  categoryRow: { gap: 4, minHeight: 44, padding: 8, borderRadius: 12 }, categoryName: { flexDirection: 'row', alignItems: 'center', gap: 8 }, categoryText: { flex: 1, fontSize: 14 }, swatch: { width: 12, height: 12, borderRadius: 4 },
});
