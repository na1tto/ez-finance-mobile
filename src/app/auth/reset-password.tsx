import { useState } from 'react';
import { Button, Text } from '@/components/VisualSystem';
import { router } from 'expo-router';
import { AuthPanel, AuthField, LoginLink } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
export default function ResetPassword() {
  const { auth, state } = useAuth(); const [password, setPassword] = useState('');
  return <AuthPanel title="Definir nova senha">
    {state.status === 'recovery' ? <><AuthField label="Nova senha" value={password} onChangeText={setPassword} password newPassword />
      <Text>Use pelo menos seis caracteres. Depois da atualização, entre novamente.</Text>
      <Button title="Salvar nova senha" disabled={state.busy || password.length < 6} onPress={async () => {
        const updated = await auth.changePassword(password);
        setPassword('');
        if (updated) router.replace('/auth/sign-in');
      }} />
      <Button title="Cancelar recuperação e sair" disabled={state.busy} onPress={async () => {
        await auth.logout();
        router.replace('/auth/sign-in');
      }} />
    </> : <><Text>Abra um link válido de recuperação solicitado neste navegador/dispositivo.</Text><LoginLink /></>}
  </AuthPanel>;
}
