import { StyleSheet, View } from "react-native";
import { Text, visual } from '@/components/VisualSystem';

import type { Transaction } from "@/types/transaction";
import { transactionCategories } from "@/constants/transactionCategories";
import { formatBRL } from "@/domain/money";

type ExpenseCardProps = {
	expense: Transaction;
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
	return (
		<View style={styles.container}>
			<View style={styles.details}>
				<Text style={[styles.category, expense.kind === 'expense' && styles.expenseText]}>{expense.kind === 'income' ? 'Receita' : 'Despesa'}</Text>
				<Text style={styles.description}>{expense.description}</Text>

				<Text style={[styles.category, expense.kind === 'expense' && styles.expenseText]}>{transactionCategories.find(c => c.id === expense.categoryId)?.name} · {expense.occurredOn}</Text>
			</View>

			<Text style={styles.value}>{formatBRL(expense.amountCents)}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	expenseText: { color: visual.text },
	details: { flexGrow: 1, flexShrink: 1, flexBasis: 180, minWidth: 0 },
	container: {
		flexDirection: "row",
    flexWrap: "wrap", gap: 12, backgroundColor: visual.surface,
		justifyContent: "space-between",
		alignItems: "center",

		padding: 16,
		marginBottom: 12,

		borderWidth: 1,
		borderRadius: 12,
		borderColor: visual.separator,
	},

	description: {
		flexShrink: 1,
		fontSize: 16,
		fontWeight: "600",
	},

	category: {
		fontSize: 13, lineHeight: 20, color: visual.muted,
		marginTop: 4,
	},

	value: {
		fontSize: 18, lineHeight: 28, maxWidth: "100%",
		fontWeight: "bold",
	},
});
