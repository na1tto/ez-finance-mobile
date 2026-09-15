import {
	Text,
	View,
	StyleSheet,
	Button,
	FlatList,
	Pressable,
} from "react-native";
import { Link } from "expo-router";
import { useExpenses } from "@/contexts/ExpensesContext";
import { ExpenseCard } from "@/components/ExpenseCard";

export default function Home() {
	const { expenses, addExpense } = useExpenses();

	const total = expenses.reduce((sum, expense) => sum + expense.value, 0);

	function handleTestExpense() {
		addExpense({
			id: Date.now().toString(),
			description: "Despesa de teste",
			value: 25,
			category: "Alimentação",
			createdAt: new Date().toISOString(),
		});
	}

	return (
		<View>
			<Text>Quantidade: {expenses.length}</Text>

			<Button title="Adicionar despesa teste" onPress={handleTestExpense} />

			<Text>Despesas cadastradas: {expenses.length}</Text>

			<FlatList
				data={expenses}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <ExpenseCard expense={item} />}
				ListEmptyComponent={<Text>Nenhuma despesa cadastrada.</Text>}
			/>
			<View style={styles.totalContainer}>
				<Text style={styles.totalLabel}>Seus gastos</Text>

				<Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
			</View>

			<Link href="/expenses/new">
				<Pressable style={styles.addButton}>
					<Text style={styles.addButtonText}>Nova despesa</Text>
				</Pressable>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	addButton: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: "#222222",
		alignItems: "center",
	},
	addButtonText: {
		color: "#ffffff",
		fontWeight: "bold",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 24,
	},

	totalContainer: {
		padding: 20,
		borderRadius: 12,
		backgroundColor: "#eeeeee",
		marginBottom: 24,
	},

	totalLabel: {
		fontSize: 14,
	},

	totalValue: {
		fontSize: 28,
		fontWeight: "bold",
		marginTop: 4,
	},

	expenseItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#dddddd",
	},
});
