import type { Category } from "../types/transaction";

export const transactionCategories: readonly Category[] = Object.freeze([
	{ id: "expense-food", kind: "expense", name: "Alimentação" },
	{ id: "expense-transport", kind: "expense", name: "Transporte" },
	{ id: "expense-leisure", kind: "expense", name: "Lazer" },
	{ id: "expense-health", kind: "expense", name: "Saúde" },
	{ id: "expense-education", kind: "expense", name: "Educação" },
	{ id: "expense-other", kind: "expense", name: "Outros" },
	{ id: "income-salary", kind: "income", name: "Salário" },
	{ id: "income-extra", kind: "income", name: "Trabalho extra" },
	{ id: "income-yield", kind: "income", name: "Rendimentos" },
	{ id: "income-other", kind: "income", name: "Outras receitas" },
].map((category) => Object.freeze(category)) as Category[]);
