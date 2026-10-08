import { useState } from 'react';
import { Button, Text } from '@/components/VisualSystem';
import { AuthField, AuthPanel, LoginLink } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
export default function SignUp() {
  const { auth, state } = useAuth(); const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  return <AuthPanel title="Criar conta" description="Comece a organizar suas receitas e despesas.">
    <AuthField label="Email" value={email} onChangeText={setEmail} /><AuthField label="Senha" value={password} onChangeText={setPassword} password newPassword />
    <Text>Use pelo menos seis caracteres. Confirme seu email para entrar.</Text>
    <Button primary title="Enviar confirmação" disabled={state.busy || state.pending || !email.trim() || password.length < 6} onPress={() => { void auth.emailLink('signup', email, password); setPassword(''); }} />
    <LoginLink />
  </AuthPanel>;
}
