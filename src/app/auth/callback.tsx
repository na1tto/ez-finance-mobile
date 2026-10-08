import { Button, Text } from '@/components/VisualSystem';
import { router } from 'expo-router';
import { AuthPanel } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
export default function Callback() {
  const { auth, state } = useAuth();
  return <AuthPanel title="Retorno da autenticação">
    <Text>{state.busy ? 'Verificando o retorno…' : 'Consulte o resultado abaixo.'}</Text>
    {state.status === 'authenticated' ? <Button title="Continuar" onPress={() => router.replace('/')} />
      : state.status === 'recovery' ? <Button title="Definir nova senha" onPress={() => router.replace('/auth/reset-password')} />
        : <Button title="Voltar para entrar" onPress={() => router.replace('/auth/sign-in')} />}
    {state.status === 'authenticated' && <Button title="Sair deste dispositivo" onPress={() => void auth.logout()} />}
  </AuthPanel>;
}
