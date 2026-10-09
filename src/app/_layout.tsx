import { useEffect } from 'react';
import { Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { Button, Text, visual, VisualProvider, useTypography, ErrorFeedback } from '@/components/VisualSystem';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ExpensesProvider } from '@/contexts/ExpensesContext';
import { authDestination } from '@/lib/auth/navigation';
import { MainTransitionProvider } from '@/components/MainNavigation';
function Navigation() {
  const { ready } = useTypography();
  const { state, auth } = useAuth();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const router = useRouter();
  useEffect(() => {
    const destination = authDestination(state.status, pathname);
    if (!state.busy && destination) router.replace(destination);
    else if (Platform.OS === 'web' && !state.busy && state.status !== 'restoring'
      && (pathname === '/auth/callback' || pathname === '/auth/reset-password')
      && (Object.keys(params).length > 0 || window.location.search || window.location.hash)) {
      // The initial URL is scrubbed before exchange. Clear Router's retained params too:
      // mounting its stack after validation must not restore an error/code into history.
      router.replace(pathname);
    }
  }, [state.status, state.busy, pathname, params, router]);
  if (state.status === 'restoring') return <View style={{ padding: 32, gap: 16 }}>
    <Text>Verificando sua sessão…</Text>
    {state.pending && <Button title="Cancelar tentativa e sair" disabled={state.busy} onPress={() => void auth.logout()} />}
  </View>;
  if (state.status === 'unavailable') return <View style={{ padding: 32, gap: 16 }}>
    <ErrorFeedback>{state.message || 'Não foi possível verificar sua sessão.'}</ErrorFeedback>
    <Button title="Tentar novamente" onPress={() => void auth.retry()} />
    <Button title="Sair deste dispositivo" onPress={() => void auth.logout()} />
  </View>;
  return <Stack screenOptions={{ contentStyle: { backgroundColor: visual.page }, headerStyle: { backgroundColor: visual.surface }, headerTintColor: visual.muted, headerTitleStyle: { fontFamily: ready ? 'ManropeSemiBold' : undefined }, headerBackTitleStyle: { fontFamily: ready ? 'ManropeRegular' : undefined } }}>
      <Stack.Protected guard={state.status !== 'authenticated'}>
        <Stack.Screen name="auth/sign-in" options={{ title: 'Entrar', headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ title: 'Criar conta', headerShown: false }} />
        <Stack.Screen name="auth/email-link" options={{ title: 'Receber link' }} />
      </Stack.Protected>
      <Stack.Protected guard={state.status === 'authenticated'}>
        <Stack.Screen name="index" options={{ title: 'Início', headerShown: false, animation: 'none' }} />
        <Stack.Screen name="transactions" options={{ title: 'Lançamentos', headerShown: false, animation: 'none' }} />
        <Stack.Screen name="expenses" options={{ headerShown: false }} />
        <Stack.Screen name="auth/account" options={{ title: 'Minha conta', headerShown: false, animation: 'none' }} />
      </Stack.Protected>
      <Stack.Screen name="auth/callback" options={{ title: 'Confirmar autenticação' }} />
      <Stack.Screen name="auth/reset-password" options={{ title: 'Recuperar senha' }} />
    </Stack>;
}
function PrivateState() {
  return <ExpensesProvider><MainTransitionProvider><Navigation /></MainTransitionProvider></ExpensesProvider>;
}
export default function RootLayout() { return <VisualProvider><AuthProvider><PrivateState /></AuthProvider></VisualProvider>; }
