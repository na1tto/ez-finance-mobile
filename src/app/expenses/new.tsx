import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	Alert,
} from "react-native";
import { useState } from "react";
import { categories } from "@/constants/categories";
import { useExpenses } from "@/contexts/ExpensesContext";
import { router } from "expo-router";

export default function NewExpense() {
	const [description, setDescription] = useState("");
	const [value, setValue] = useState("");
	const [category, setCategory] = useState("");
	const { addExpense } = useExpenses();
	function handleSave() {
		const numericValue = Number(value.replace(",", "."));

		if (!description.trim()) {
			Alert.alert("Campo obrigatório", "Informe uma descrição");
			return;
		}

		if (!numericValue || numericValue <= 0) {
			Alert.alert("Valor inválido", "informe um valor maior que zero.");
			return;
		}

		if (!category) {
			Alert.alert("Campo obrigatório", "Selecione uma categoria");
			return;
		}

		addExpense({
			id: Date.now().toString(),
			description,
			value: numericValue,
			category,
			createdAt: new Date().toISOString(),
		});

		router.back();
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Nova Despesesa</Text>

			<Text style={styles.label}>Descrição</Text>

			<TextInput
				style={styles.input}
				placeholder="O que você comprou?"
				value={description}
				onChangeText={setDescription}
			/>

			<TextInput
				style={styles.input}
				placeholder="0,00"
				value={value}
				onChangeText={setValue}
				keyboardType="decimal-pad"
			/>

			<Text style={styles.label}>Categoria</Text>

			<View style={styles.categories}>
				{categories.map((item) => (
					<Pressable
						key={item}
						style={[
							styles.categoryButton,
							category === item && styles.categoryButtonSelected,
						]}
						onPress={() => setCategory(item)}
					>
						<Text>{item}</Text>
					</Pressable>
				))}
			</View>

			<Pressable style={styles.saveButton} onPress={handleSave}>
				<Text style={styles.saveButtonText}>Salvar despesa</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		gap: 24,
	},

	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
	},
	input: {
		borderWidth: 1,
		borderColor: "#cccccc",
		borderRadius: 8,
		padding: 12,
	},
	categories: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	categoryButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: "#eeeeee",
	},
	categoryButtonSelected: {
		borderWidth: 2,
	},
	saveButton: {
		marginTop: 24,
		padding: 16,
		borderRadius: 8,
		backgroundColor: "#222222",
		alignItems: "center",
	},
	saveButtonText: {
		color: "#ffffff",
		fontWeight: "bold",
	},
});
