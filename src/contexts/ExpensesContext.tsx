import { createContext, ReactNode, useContext, useState } from "react";

import type * as ExpenseTypes from "@/types/expense";

type ExpensesContextType = {
	expenses: ExpenseTypes.Expense[];
	addExpense: (expense: ExpenseTypes.Expense) => void;
	removeExpense: (id: string) => void;
};

const ExpensesContext = createContext<ExpensesContextType | undefined>(
	undefined,
);

export function ExpensesProvider({ children }: { children: ReactNode }) {
	const [expenses, setExpenses] = useState<ExpenseTypes.Expense[]>([]);

	function addExpense(expense: ExpenseTypes.Expense) {
		setExpenses((currentExpenses) => [...currentExpenses, expense]);
	}

	function removeExpense(id: string) {
		setExpenses((currentExpenses) =>
			currentExpenses.filter((expense) => expense.id !== id),
		);
	}

	return (
		<ExpensesContext.Provider
			value={{
				expenses,
				addExpense,
				removeExpense,
			}}
		>
			{children}
		</ExpensesContext.Provider>
	);
}

export function useExpenses() {
	const context = useContext(ExpensesContext);

	if (!context) {
		throw new Error(
			"useExpenses deve ser utilizado dentro de ExpensesProvider",
		);
	}

	return context;
}
