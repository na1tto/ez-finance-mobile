import { Text, View, StyleSheet, Button } from "react-native";
import { Link } from "expo-router";
import { useExpenses } from "@/contexts/ExpensesContext";

export default function Home() {
	const { expenses, addExpense } = useExpenses();

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

			<Link style={styles.container} href="/expenses/new">
				Nova Despesa
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
