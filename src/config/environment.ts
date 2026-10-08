import { readPublicSupabaseConfig } from "./supabase";

export function readPublicSupabaseEnvironment() {
	// Expo only inlines static dot-property references to EXPO_PUBLIC_* variables.
	return readPublicSupabaseConfig({
		url: process.env.EXPO_PUBLIC_SUPABASE_URL,
		publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	});
}
