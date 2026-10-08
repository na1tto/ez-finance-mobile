import { useRef } from 'react';
import { Modal, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text, visual } from '@/components/VisualSystem';

export function FinancialConfirmation({ visible, title, message, confirmLabel, onCancel, onConfirm }: {
  visible: boolean; title: string; message: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void;
}) {
  const cancel = useRef<View>(null);
  return <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel} onShow={() => cancel.current?.focus()}>
    <View style={styles.backdrop}><View role="dialog" accessibilityLabel={title} accessibilityViewIsModal style={styles.dialog}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <ScrollView style={styles.messageScroll} keyboardShouldPersistTaps="handled"><Text style={styles.message}>{message}</Text></ScrollView>
      <Pressable ref={cancel} accessibilityRole="button" style={styles.button} onPress={onCancel}><Text>Continuar editando</Text></Pressable>
      <Pressable accessibilityRole="button" style={[styles.button, styles.danger]} onPress={onConfirm}><Text style={styles.dangerText}>{confirmLabel}</Text></Pressable>
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 480, maxHeight: '90%', alignSelf: 'center', backgroundColor: visual.surface, borderRadius: 12, padding: 24, gap: 16 },
  messageScroll: { flexGrow: 0, flexShrink: 1 },
  title: { fontSize: 22, fontWeight: '600', color: visual.text }, message: { fontSize: 16, lineHeight: 24, color: visual.text },
  button: { minHeight: 44, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: visual.border, alignItems: 'center' },
  danger: { borderColor: visual.danger }, dangerText: { color: visual.danger, fontWeight: '600' } });
