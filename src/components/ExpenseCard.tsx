import { StyleSheet, Text, View } from "react-native";

import type { Expense } from "@/types/expense";

type ExpenseCardProps = {
	expense: Expense;
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.description}>{expense.description}</Text>

				<Text style={styles.category}>{expense.category}</Text>
			</View>

			<Text style={styles.value}>R$ {expense.value.toFixed(2)}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",

		padding: 16,
		marginBottom: 12,

		borderWidth: 1,
		borderRadius: 12,
		borderBottomColor: "#dddddd",
	},

	description: {
		fontSize: 16,
		fontWeight: "600",
	},

	category: {
		fontSize: 14,
		marginTop: 4,
	},

	value: {
		fontSize: 16,
		fontWeight: "bold",
	},
});
