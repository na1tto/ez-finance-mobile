export type TransactionKind = "income" | "expense";

export type Category = Readonly<{
	id: string;
	kind: TransactionKind;
	name: string;
}>;

// Editable fields only: identity, owner and creation time belong to the database.
export type TransactionInput = {
	kind: TransactionKind;
	description: string;
	amountCents: number;
	categoryId: string;
	occurredOn: string;
};

export type TransactionDraft = Omit<TransactionInput, "amountCents" | "occurredOn"> & {
	amountText: string;
	occurredOn?: string;
};

export type Transaction = TransactionInput & {
	id: string;
	userId: string;
	createdAt: string;
};

export type TransactionTotals = {
	incomeCents: number;
	expenseCents: number;
	balanceCents: number;
};

export type TransactionQuery = { month: string; categoryId?: string };
export type TransactionQueryResult = {
	transactions: Transaction[];
	totals: TransactionTotals;
};

export type TransactionRow = {
	id: string;
	user_id: string;
	kind: TransactionKind;
	description: string;
	amount_cents: number;
	category_id: string;
	occurred_on: string;
	created_at: string;
};
