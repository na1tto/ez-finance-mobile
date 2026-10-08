import { Button, Text } from '@/components/VisualSystem';
import { AuthPanel } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
export default function Account() {
  const { auth, state } = useAuth();
  return <AuthPanel title="Minha conta"><Text>{state.session?.user.email}</Text>
    <Text>Escolha no Google o mesmo email confirmado desta conta. O serviço verifica o vínculo; contas existentes não são fundidas.</Text>
    <Button title="Vincular Google a esta conta" disabled={state.busy || state.pending} onPress={() => void auth.google(true)} />
    <Button title="Definir ou recuperar senha por email" disabled={state.busy || state.pending || !state.session?.user.email} onPress={() => void auth.emailLink('recovery', state.session!.user.email!)} />
    <Button title="Sair deste dispositivo" onPress={() => void auth.logout()} />
  </AuthPanel>;
}
