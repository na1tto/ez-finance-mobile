import { readPublicSupabaseEnvironment } from "../config/environment";
import { createSupabaseClientProvider } from "./supabase/client";
import { authStorage } from './auth/platform';

// The application's single entry point. No client/login is created on import.
export const getSupabaseClient = createSupabaseClientProvider(readPublicSupabaseEnvironment, authStorage);
