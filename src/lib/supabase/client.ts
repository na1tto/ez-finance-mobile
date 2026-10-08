import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readPublicSupabaseConfig, type PublicSupabaseEnvironment } from "../../config/supabase";
import type { AuthStorage } from '../auth/storage';
import { sessionKey } from '../auth/storage';

/** One lazy client per provider; invalid configuration never creates a connection. */
export function createSupabaseClientProvider(readEnvironment: () => PublicSupabaseEnvironment, storage?: AuthStorage) {
	let client: SupabaseClient | undefined;
	return function getClient(): SupabaseClient {
		if (!client) {
			const config = readPublicSupabaseConfig(readEnvironment());
			client = createClient(config.url, config.publishableKey, {
				auth: {
					flowType: "pkce",
					storage,
					storageKey: sessionKey(config.url),
					persistSession: !!storage,
					autoRefreshToken: !!storage,
					// SPEC-003 must correlate and explicitly handle the callback/code exchange.
					detectSessionInUrl: false,
				},
			});
		}
		return client;
	};
}
