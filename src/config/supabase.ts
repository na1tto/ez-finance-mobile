export type PublicSupabaseConfig = Readonly<{
	url: string;
	publishableKey: string;
}>;

export type PublicSupabaseEnvironment = {
	url?: string;
	publishableKey?: string;
};

export class SupabaseConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SupabaseConfigurationError";
	}
}

function isPublicKey(key: string): boolean {
	if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
	// Legacy keys are JWTs. Only anon is appropriate for an application bundle.
	if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return false;
	try {
		const payload = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
		const decoded: unknown = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
		return typeof decoded === "object" && decoded !== null
			&& "role" in decoded && decoded.role === "anon";
	} catch {
		return false;
	}
}

export function readPublicSupabaseConfig(environment: PublicSupabaseEnvironment): PublicSupabaseConfig {
	const url = environment.url?.trim();
	if (!url) throw new SupabaseConfigurationError("EXPO_PUBLIC_SUPABASE_URL não configurada.");
	try {
		const parsed = new URL(url);
		if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname
			|| parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error();
	} catch {
		throw new SupabaseConfigurationError("EXPO_PUBLIC_SUPABASE_URL deve ser uma URL HTTP(S) sem credenciais, query ou fragmento.");
	}
	const publishableKey = environment.publishableKey?.trim();
	if (!publishableKey) {
		throw new SupabaseConfigurationError("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configurada.");
	}
	if (!isPublicKey(publishableKey)) {
		throw new SupabaseConfigurationError("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY deve ser publishable ou JWT anon; chaves administrativas não são permitidas.");
	}
	return Object.freeze({ url: url.replace(/\/+$/, ""), publishableKey });
}
