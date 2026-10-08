import { createContext, useContext, useState, type ReactNode } from 'react';
import { useFonts } from 'expo-font';
import { Pressable, StyleSheet, Text as NativeText, type TextProps } from 'react-native';
import { jade } from '@/constants/jade';
import { tomato } from '@/constants/tomato';

export const visual = {
  page: jade.jade2, surface: jade.jade1, control: jade.jade3,
  hover: jade.jade4, selected: jade.jade5, separator: jade.jade6,
  border: jade.jade7, focus: jade.jade8, solid: jade.jade9, solidHover: jade.jade10,
  muted: jade.jade11, text: jade.jade12, logo: '#44BA5D', danger: tomato.tomato11,
  errorSurface: tomato.tomato2, errorAccent: tomato.tomato9,
  radius: 12, controlHeight: 48,
} as const;
const Typography = createContext({ ready: false, error: false });
export function VisualProvider({ children }: { children: ReactNode }) {
  const [ready, error] = useFonts({
    ManropeRegular: require('../../assets/fonts/manrope/Manrope_400Regular.ttf'),
    ManropeSemiBold: require('../../assets/fonts/manrope/Manrope_600SemiBold.ttf'),
    ManropeBold: require('../../assets/fonts/manrope/Manrope_700Bold.ttf'),
  });
  return <Typography.Provider value={{ ready, error: !!error }}>{children}</Typography.Provider>;
}
export const useTypography = () => useContext(Typography);
export function ErrorFeedback({ children }: { children: ReactNode }) {
  return <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{children}</Text>;
}
// Resolve real font faces instead of synthesizing bold from the regular asset.
export function Text({ style, ...props }: TextProps) {
  const { ready } = useTypography();
  const weight = StyleSheet.flatten(style)?.fontWeight;
  const family = weight === 'bold' || Number(weight) >= 700 ? 'ManropeBold'
    : Number(weight) >= 500 ? 'ManropeSemiBold' : 'ManropeRegular';
  return <NativeText {...props} style={[styles.text, style, ready && { fontFamily: family, fontWeight: 'normal' }]} />;
}
export function Button({ title, disabled = false, onPress, primary = false }: {
  title: string; disabled?: boolean; onPress: () => void; primary?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => [styles.button, primary && styles.primary,
      !disabled && hovered && (primary ? styles.primaryHover : styles.hover),
      !disabled && pressed && (primary ? styles.primaryHover : styles.pressed), disabled && styles.disabled]}>
    <Text style={[styles.buttonText, primary && styles.primaryText]}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  error: { color: visual.danger, backgroundColor: visual.errorSurface, borderLeftWidth: 4, borderLeftColor: visual.errorAccent,
    borderRadius: visual.radius, padding: 12, fontWeight: '600', fontSize: 14, lineHeight: 22 },
  text: { fontSize: 15, lineHeight: 24, color: visual.text },
  button: { minHeight: visual.controlHeight, paddingVertical: 12, paddingHorizontal: 16, borderRadius: visual.radius,
    borderWidth: 2, borderColor: visual.border, backgroundColor: visual.control, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 15, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
  primary: { backgroundColor: visual.solid, borderColor: visual.solid },
  // White/Jade 9 meets 3:1: use the actual 700 face at large-text size.
  primaryText: { color: '#fff', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  primaryHover: { backgroundColor: visual.solidHover, borderColor: visual.solidHover },
  hover: { backgroundColor: visual.hover, borderColor: visual.focus },
  pressed: { backgroundColor: visual.selected, borderColor: visual.focus },
  disabled: { opacity: 0.55 },
});
