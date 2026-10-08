import { useState } from 'react';
import { Button, Text } from '@/components/VisualSystem';
import { AuthField, AuthPanel, LoginLink } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
export default function EmailLink() {
  const { auth, state } = useAuth(); const [email, setEmail] = useState('');
  return <AuthPanel title="Receber um novo link">
    <AuthField label="Email" value={email} onChangeText={setEmail} />
    <Text>Abra o link no mesmo navegador/dispositivo que fez o pedido. Cancele a tentativa anterior antes de reenviar.</Text>
    <Button title="Reenviar confirmação" disabled={state.busy || state.pending || !email.trim()} onPress={() => void auth.emailLink('confirmation', email)} />
    <Button title="Recuperar senha" disabled={state.busy || state.pending || !email.trim()} onPress={() => void auth.emailLink('recovery', email)} /><LoginLink />
  </AuthPanel>;
}
