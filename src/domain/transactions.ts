import { transactionCategories } from "../constants/transactionCategories";
import type { Transaction, TransactionDraft, TransactionInput, TransactionQuery, TransactionQueryResult, TransactionRow, TransactionTotals } from "../types/transaction";
import { civilToday, monthlyPeriod, validateCivilDate, validateOccurredOn } from "./dates";
import { parseAmountCents, safeSumCents, validateAmountCents } from "./money";

export function validateTransactionInput(input: TransactionInput, today = civilToday()): TransactionInput {
	if (input.kind !== "income" && input.kind !== "expense") throw new Error("Tipo inválido.");
	const description = input.description.trim();
	if (!description) throw new Error("Informe uma descrição.");
	if (!transactionCategories.some((category) => category.id === input.categoryId && category.kind === input.kind)) {
		throw new Error("Categoria incompatível com o tipo.");
	}
	return { kind: input.kind, description, amountCents: validateAmountCents(input.amountCents),
		categoryId: input.categoryId, occurredOn: validateOccurredOn(input.occurredOn, today) };
}

export function validateTransactionDraft(draft: TransactionDraft, today = civilToday()): TransactionInput {
	return validateTransactionInput({ ...draft, amountCents: parseAmountCents(draft.amountText), occurredOn: draft.occurredOn ?? today }, today);
}

export function transactionTotals(items: readonly TransactionInput[]): TransactionTotals {
	const income: number[] = [], expense: number[] = [];
	for (const item of items) {
		validateAmountCents(item.amountCents);
		if (item.kind !== "income" && item.kind !== "expense") throw new Error("Tipo inválido.");
		(item.kind === "income" ? income : expense).push(item.amountCents);
	}
	const incomeCents = safeSumCents(income), expenseCents = safeSumCents(expense);
	return { incomeCents, expenseCents, balanceCents: safeSumCents([incomeCents, -expenseCents]) };
}

// Caller supplies an already authorized collection; this is not an access boundary.
export function queryTransactions(items: readonly Transaction[], query: TransactionQuery): TransactionQueryResult {
	const period = monthlyPeriod(query.month);
	if (query.categoryId !== undefined && !transactionCategories.some((c) => c.id === query.categoryId)) throw new Error("Categoria inexistente.");
	const transactions = items.filter((item) => {
		validateCivilDate(item.occurredOn);
		return item.occurredOn >= period.start && (period.endExclusive === null || item.occurredOn < period.endExclusive)
			&& (query.categoryId === undefined || item.categoryId === query.categoryId);
	});
	return { transactions, totals: transactionTotals(transactions) };
}

export function transactionFromRow(row: TransactionRow): Transaction {
	// Reading historical data does not revalidate against today's clock.
	const input = validateTransactionInput({ kind: row.kind, description: row.description, amountCents: row.amount_cents,
		categoryId: row.category_id, occurredOn: row.occurred_on }, row.occurred_on);
	return { ...input, id: row.id, userId: row.user_id, createdAt: row.created_at };
}

export function transactionInputToRow(input: TransactionInput, today = civilToday()) {
	const valid = validateTransactionInput(input, today);
	return { kind: valid.kind, description: valid.description, amount_cents: valid.amountCents,
		category_id: valid.categoryId, occurred_on: valid.occurredOn };
}
