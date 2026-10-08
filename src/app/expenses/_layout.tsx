import { Stack } from 'expo-router';
import { visual, useTypography } from '@/components/VisualSystem';
export default function ExpensesLayout() { const { ready } = useTypography(); return <Stack screenOptions={{ headerBackButtonMenuEnabled: false, contentStyle: { backgroundColor: visual.page }, headerStyle: { backgroundColor: visual.surface }, headerTintColor: visual.muted, headerTitleStyle: { fontFamily: ready ? 'ManropeSemiBold' : undefined }, headerBackTitleStyle: { fontFamily: ready ? 'ManropeRegular' : undefined } }}>
  <Stack.Screen name="new" options={{ title: 'Novo lançamento' }} />
  <Stack.Screen name="[id]" options={{ title: 'Editar lançamento' }} />
</Stack>; }
