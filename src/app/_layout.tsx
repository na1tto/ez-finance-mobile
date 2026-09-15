import { Stack } from "expo-router";

import { ExpensesProvider } from "@/contexts/ExpensesContext";

export default function RootLayout() {
	return (
		<ExpensesProvider>
			<Stack />
		</ExpensesProvider>
	);
}
