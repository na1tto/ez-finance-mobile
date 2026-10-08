import { ScrollView, TextInput, StyleSheet, View, Platform } from 'react-native';
import { Text, Button, useTypography, visual, ErrorFeedback } from '@/components/VisualSystem';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createElement, useId, useRef, useState, type ReactNode } from 'react';
export function AuthPanel({ title, children, description, pendingAction }: { title: string; children: ReactNode; description?: string; pendingAction?: ReactNode }) {
  const { state, auth } = useAuth();
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.card}>
    <View style={styles.heading}>
      <Text accessibilityLabel="Ez Finance" style={styles.logo}>EZ$</Text>
      <Text style={styles.eyebrow}>SEU CONTROLE FINANCEIRO</Text>
    </View>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {children}
    {!!state.message && (state.messageKind === 'info' ? <Text accessibilityLiveRegion="polite" style={styles.message}>{state.message}</Text> : <ErrorFeedback>{state.message}</ErrorFeedback>)}
    {state.pending && (pendingAction ?? <Button title="Cancelar tentativa pendente" disabled={state.busy} onPress={() => void auth.cancelAttempt()} />)}
    <Text style={styles.note}>Ambiente de avaliação.</Text>
  </View></ScrollView>;
}
export function AuthField({ label, value, onChangeText, password = false, newPassword = false, onSubmitEditing }: { label: string; value: string; onChangeText: (v: string) => void; password?: boolean; newPassword?: boolean; onSubmitEditing?: () => void }) {
  const { ready: fontReady } = useTypography();
  const id = useId(); const input = useRef<TextInput>(null); const [focused, setFocused] = useState(false);
  const labelText = <Text style={styles.label}>{label}</Text>;
  return <View style={styles.field}>
    {Platform.OS === 'web' ? createElement('label', { htmlFor: id }, labelText) : <Text onPress={() => input.current?.focus()}>{labelText}</Text>}
    <View style={[styles.inputRow, focused && styles.inputFocused]}>
      <Image source={password ? require('../../assets/icons/phosphor/lock.svg') : require('../../assets/icons/phosphor/envelope.svg')} style={styles.icon} tintColor={visual.muted} alt="" accessible={false} />
      <TextInput ref={input} nativeID={id} accessibilityLabel={label} value={value} onChangeText={onChangeText}
    secureTextEntry={password} autoCapitalize="none" autoCorrect={false} autoComplete={password ? (newPassword ? 'new-password' : 'current-password') : 'email'}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onSubmitEditing={onSubmitEditing}
    keyboardType={password ? 'default' : 'email-address'} style={[styles.input, fontReady && { fontFamily: 'ManropeRegular' }]} />
    </View></View>;
}
export function LoginLink() { return <Link href="/auth/sign-in" style={authStyles.link}>Voltar para entrar</Link>; }
export const authStyles = StyleSheet.create({ link: { color: visual.muted, paddingVertical: 12, fontFamily: 'ManropeRegular', fontSize: 14, lineHeight: 22, textAlign: 'center' } });
const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: visual.page },
  card: { width: '100%', maxWidth: 448, padding: 24, gap: 16, borderRadius: 28, backgroundColor: visual.surface },
  heading: { gap: 8, marginBottom: 8 },
  logo: { fontWeight: '700', fontSize: 44, lineHeight: 56, color: visual.logo, letterSpacing: -2 },
  eyebrow: { fontSize: 11, lineHeight: 16, letterSpacing: 1.4, color: visual.muted },
  title: { fontSize: 28, lineHeight: 36, color: visual.text, fontWeight: '700', letterSpacing: -0.6 },
  description: { fontSize: 15, lineHeight: 24, color: visual.muted, marginBottom: 8 },
  field: { gap: 8 },
  label: { fontWeight: '600', fontSize: 14, lineHeight: 20, color: visual.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: visual.border, borderRadius: 12, backgroundColor: visual.control, paddingLeft: 12 },
  inputFocused: { borderColor: visual.focus },
  input: { flex: 1, minWidth: 0, borderWidth: 0, borderRadius: 10, padding: 12, fontSize: 16, minHeight: visual.controlHeight, color: visual.text },
  icon: { width: 20, height: 20 },
  message: { backgroundColor: visual.control, borderColor: visual.separator, borderWidth: 1, borderRadius: 12, padding: 12, color: visual.text, fontSize: 14, lineHeight: 22 },
  note: { textAlign: 'center', fontSize: 12, lineHeight: 20, color: visual.muted, marginTop: 8 },
});
