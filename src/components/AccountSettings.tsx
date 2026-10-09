import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Button, ErrorFeedback, Text, visual } from './VisualSystem';

type AccountProps = {
  email?: string | null; busy: boolean; pending: boolean; message: string; messageKind?: 'info' | 'error';
  onGoogle: () => void; onPassword: () => void; onLogout: () => void; onCancelAttempt: () => void;
};

export function AccountSettings({ email, busy, pending, message, messageKind, onGoogle, onPassword, onLogout, onCancelAttempt }: AccountProps) {
  const [logoutHovered, setLogoutHovered] = useState(false);
  const blocked = busy || pending;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.heading}>
      <Text accessibilityLabel="Ez Finance" style={styles.logo}>EZ$</Text>
      <Text accessibilityRole="header" style={styles.title}>Minha conta</Text>
      <Text style={styles.support}>Gerencie as formas de acesso à sua conta.</Text>
    </View>

    <View style={styles.identity}>
      <View style={styles.avatar}><Image source={require('../../assets/icons/phosphor/user-circle.svg')} style={styles.profileIcon} tintColor={visual.text} alt="" accessible={false} /></View>
      <Text style={styles.caption}>Email da conta</Text>
      <Text selectable style={styles.email}>{email || 'Email indisponível'}</Text>
    </View>

    {(!!message || busy || pending) && <View style={styles.feedback}>
      {!!message && (messageKind === 'info' ? <Text accessibilityLiveRegion="polite" style={styles.information}>{message}</Text> : <ErrorFeedback>{message}</ErrorFeedback>)}
      {busy && <Text accessibilityLiveRegion="polite">Processando solicitação…</Text>}
      {pending && <View style={styles.pending}>
        <Text style={styles.support}>Conclua a tentativa iniciada ou cancele antes de solicitar outra.</Text>
        <Button title="Cancelar tentativa pendente" disabled={busy} onPress={onCancelAttempt} />
      </View>}
    </View>}

    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Acesso à conta</Text>
      <View style={styles.accessCards}>
        <AccountAction title="Vincular Google a esta conta" description="Escolha no Google o mesmo email confirmado desta conta. O serviço verifica o vínculo; contas existentes não são fundidas."
          icon={require('../../assets/icons/phosphor/lock.svg')} disabled={blocked} onPress={onGoogle} />
        <View style={styles.divider} />
        <AccountAction title="Definir ou recuperar senha por email" description="Receba um link no email desta conta para definir ou recuperar sua senha."
          icon={require('../../assets/icons/phosphor/envelope.svg')} disabled={blocked || !email} onPress={onPassword} />
      </View>
    </View>

    <View style={styles.session}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Sessão neste dispositivo</Text>
      <Text style={styles.support}>Sair encerra sua sessão neste dispositivo.</Text>
      <Pressable accessibilityRole="button" onPress={onLogout} onHoverIn={() => setLogoutHovered(true)} onHoverOut={() => setLogoutHovered(false)}
        style={({ pressed }) => [styles.logout, (pressed || logoutHovered) && styles.logoutHover]}>
        <Text style={styles.logoutText}>Sair deste dispositivo</Text>
      </Pressable>
    </View>
    <Text style={styles.note}>Ambiente de avaliação.</Text>
  </ScrollView>;
}

function AccountAction({ title, description, icon, disabled, onPress }: {
  title: string; description: string; icon: number; disabled: boolean; onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => [styles.accessRow, !disabled && (hovered || pressed) && styles.rowHover, disabled && styles.disabled]}>
    <View style={styles.iconCircle}><Image source={icon} style={styles.icon} tintColor={visual.muted} alt="" accessible={false} /></View>
    <View style={styles.rowText}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.support}>{description}</Text></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: visual.page }, content: { padding: 20, paddingBottom: 32, gap: 24, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { gap: 8 }, logo: { fontSize: 28, lineHeight: 36, fontWeight: '700', color: visual.logo }, title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  support: { fontSize: 14, lineHeight: 22 }, identity: { backgroundColor: visual.control, borderRadius: 28, padding: 24, gap: 12, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: visual.surface, borderWidth: 4, borderColor: visual.surface, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { width: 40, height: 40 }, caption: { fontSize: 13, lineHeight: 20, fontWeight: '600', color: visual.muted }, email: { fontSize: 20, lineHeight: 28, fontWeight: '600', textAlign: 'center', alignSelf: 'stretch' },
  feedback: { gap: 12 }, information: { backgroundColor: visual.control, padding: 16, borderRadius: 16 }, pending: { gap: 12 },
  section: { gap: 12 }, sectionTitle: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
  accessCards: { padding: 8, borderRadius: 24, backgroundColor: visual.surface }, accessRow: { minHeight: visual.controlHeight, flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: visual.control, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, minWidth: 0, gap: 6 }, rowHover: { backgroundColor: visual.hover }, disabled: { opacity: 0.55 }, divider: { height: 1, backgroundColor: visual.separator, marginHorizontal: 16 },
  icon: { width: 20, height: 20 }, cardTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  session: { gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: visual.separator }, logout: { minHeight: visual.controlHeight, padding: 12, borderRadius: visual.radius, borderWidth: 1, borderColor: visual.danger, backgroundColor: visual.surface, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  logoutHover: { backgroundColor: visual.errorSurface }, logoutText: { fontWeight: '600', color: visual.danger, textAlign: 'center' }, note: { fontSize: 12, lineHeight: 20, color: visual.muted },
});
