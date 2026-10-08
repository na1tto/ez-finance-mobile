import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Text, useTypography, ErrorFeedback } from '@/components/VisualSystem';
import { AuthField, AuthPanel } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';
import { jade } from '@/constants/jade';

export default function SignIn() {
  const { auth, state } = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const { ready: fontReady, error: fontError } = useTypography();
  const blocked = state.busy || state.pending;
  const submit = () => {
    if (blocked || !email.trim() || !password) return;
    void auth.signIn(email, password); setPassword('');
  };
  return <AuthPanel title="Bom ter você por aqui" description="Entre para acompanhar suas receitas e despesas."
    pendingAction={<Button title="Cancelar tentativa pendente" disabled={state.busy} onPress={() => void auth.cancelAttempt()} />}>
    <Button title={state.busy ? 'Aguarde a autenticação…' : 'Continuar com Google'} disabled={blocked} onPress={() => void auth.google()} primary />
    <View style={styles.divider}><View style={styles.line} /><Text style={[styles.dividerText, fontReady && styles.regular]}>ou entre com email</Text><View style={styles.line} /></View>
    <AuthField label="Email" value={email} onChangeText={setEmail} />
    <AuthField label="Senha" value={password} onChangeText={setPassword} password onSubmitEditing={submit} />
    <Button title={state.busy ? 'Verificando acesso…' : 'Entrar com email e senha'} disabled={blocked || !email.trim() || !password} onPress={submit} />
    <View style={styles.links}>
      <Link href="/auth/sign-up" style={[styles.link, fontReady && styles.semibold]}>Criar conta por email</Link>
      <Link href="/auth/email-link" style={[styles.link, styles.recovery, fontReady && styles.regular]}>Reenviar confirmação ou recuperar senha</Link>
    </View>
    {fontError && <ErrorFeedback>A fonte não carregou. Você pode entrar normalmente.</ErrorFeedback>}
  </AuthPanel>;
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: jade.jade6 },
  dividerText: { fontSize: 12, lineHeight: 20, color: jade.jade11 },
  links: { alignItems: 'center', gap: 4 },
  link: { color: jade.jade11, paddingVertical: 8, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  recovery: { fontSize: 12, lineHeight: 20 },
  fallback: { fontSize: 12, lineHeight: 20, color: jade.jade11 },
  regular: { fontFamily: 'ManropeRegular' }, semibold: { fontFamily: 'ManropeSemiBold' },
});
