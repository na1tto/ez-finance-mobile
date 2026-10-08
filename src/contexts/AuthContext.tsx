import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { getSupabaseClient } from '@/lib/supabase';
import { readPublicSupabaseEnvironment } from '@/config/environment';
import { readPublicSupabaseConfig } from '@/config/supabase';
import { AuthController, type AuthState } from '@/lib/auth/controller';
import { authStorage, callbackUrl, openGoogle, randomAttemptId, serializeAuth } from '@/lib/auth/platform';
import { sessionKey } from '@/lib/auth/storage';

const AuthContext = createContext<{ state: AuthState; auth: AuthController } | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth] = useState(() => new AuthController({
    client: getSupabaseClient(), storage: authStorage,
    key: sessionKey(readPublicSupabaseConfig(readPublicSupabaseEnvironment()).url),
    redirect: callbackUrl, randomId: randomAttemptId, serialize: serializeAuth, openOAuth: openGoogle,
  }));
  const [state, setState] = useState(auth.getSnapshot());
  useEffect(() => {
    const unsubscribe = auth.subscribe(() => setState(auth.getSnapshot()));
    const scrub = (url: string) => {
      if (Platform.OS === 'web' && /\/auth\/(callback|reset-password)/.test(window.location.pathname)) window.history.replaceState(null, '', window.location.pathname);
      return url;
    };
    if (Platform.OS === 'web') void auth.start(scrub(window.location.href));
    else void Linking.getInitialURL().then(url => auth.start(url ?? undefined));
    const links = Linking.addEventListener('url', ({ url }) => { void auth.handleCallback(scrub(url)); });
    const client = getSupabaseClient();
    if (Platform.OS !== 'web' && AppState.currentState !== 'active') client.auth.stopAutoRefresh();
    const appState = AppState.addEventListener('change', value => {
      if (Platform.OS !== 'web') { if (value === 'active') client.auth.startAutoRefresh(); else client.auth.stopAutoRefresh(); }
    });
    const key = sessionKey(readPublicSupabaseConfig(readPublicSupabaseEnvironment()).url);
    const storageChanged = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key === null || (event.key === key && event.newValue === null)) auth.invalidateLocal();
      else if (event.key === key || event.key === key + '.recovery' || (event.key === key + '.attempt' && event.newValue === null)) void auth.synchronizeSession();
    };
    const online = () => { if (auth.getSnapshot().status === 'unavailable') void auth.retry(); };
    if (Platform.OS === 'web') { window.addEventListener('storage', storageChanged); window.addEventListener('online', online); }
    return () => { unsubscribe(); auth.stop(); links.remove(); appState.remove();
      if (Platform.OS === 'web') { window.removeEventListener('storage', storageChanged); window.removeEventListener('online', online); }
    };
  }, [auth]);
  return <AuthContext.Provider value={{ state, auth }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider ausente.'); return value; }
