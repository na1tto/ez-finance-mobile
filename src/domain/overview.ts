import { monthlyPeriod, validateCivilDate } from './dates';
import { safeSumCents } from './money';
import { transactionCategories } from '../constants/transactionCategories';
import type { Transaction, TransactionKind } from '../types/transaction';

// Civil intervals within the selected month, not rolling weeks or projections.
export function weeklyActivity(transactions: readonly Transaction[], month: string) {
  monthlyPeriod(month);
  let days = 31;
  while (days > 28) {
    try { validateCivilDate(`${month}-${days}`); break; } catch { days--; }
  }
  return Array.from({ length: Math.ceil(days / 7) }, (_, index) => {
    const start = index * 7 + 1, end = Math.min(start + 6, days);
    const rows = transactions.filter(row => row.occurredOn.slice(0, 7) === month
      && Number(row.occurredOn.slice(8)) >= start && Number(row.occurredOn.slice(8)) <= end);
    return { label: `${start}–${end}`, incomeCents: safeSumCents(rows.filter(row => row.kind === 'income').map(row => row.amountCents)),
      expenseCents: safeSumCents(rows.filter(row => row.kind === 'expense').map(row => row.amountCents)) };
  });
}

export function categoryActivity(transactions: readonly Transaction[], kind: TransactionKind) {
  const groups = transactionCategories.filter(category => category.kind === kind).map(category => ({
    ...category, amountCents: safeSumCents(transactions.filter(row => row.kind === kind && row.categoryId === category.id).map(row => row.amountCents)),
  })).filter(category => category.amountCents > 0).sort((a, b) => b.amountCents - a.amountCents);
  const totalCents = safeSumCents(groups.map(group => group.amountCents));
  return { totalCents, groups: groups.map(group => ({ ...group, fraction: group.amountCents / totalCents })) };
}

// Native hit testing for the 200px ring (r76, stroke24); the center is not a category.
export function categoryAtRingPoint(groups: readonly { id: string; fraction: number }[], x: number, y: number, progress = 1): string | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const dx = x - 100, dy = y - 100, radius = Math.hypot(dx, dy);
  if (radius < 64 || radius > 88) return null;
  const fraction = (Math.atan2(dy, dx) / (2 * Math.PI) + 1.25) % 1;
  if (fraction > progress) return null;
  let end = 0;
  return groups.find(group => { end += group.fraction; return fraction < end; })?.id ?? null;
}
