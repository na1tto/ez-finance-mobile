import { createElement, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, PanResponder, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, visual } from './VisualSystem';
import { ReducedMotionProvider, StaticMotion, useReducedMotion } from '@/hooks/useReducedMotion';

const destinations = [
  { href: '/' as const, label: 'Início', icon: require('../../assets/icons/phosphor/house.svg') },
  { href: '/transactions' as const, label: 'Lançamentos', icon: require('../../assets/icons/phosphor/receipt.svg') },
  { href: '/auth/account' as const, label: 'Minha conta', icon: require('../../assets/icons/phosphor/user-circle.svg') },
];
export type MainPath = typeof destinations[number]['href'];
export function MainTransitionProvider({ children }: { children: ReactNode }) {
  return <ReducedMotionProvider>{children}</ReducedMotionProvider>;
}
function Destination({ item, selected, onNavigate }: { item: typeof destinations[number]; selected: boolean; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false), [pressed, setPressed] = useState(false);
  return <Link href={item.href} replace asChild>
    <Pressable accessibilityLabel={item.label} accessibilityState={{ selected }} aria-current={selected ? 'page' : undefined} onPress={onNavigate}
      onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      style={StyleSheet.flatten([styles.destination, selected && styles.selected, (pressed || hovered) && styles.hover])}>
      <Image source={item.icon} style={styles.icon} tintColor={selected ? visual.text : visual.muted} alt="" accessible={false} />
      <Text style={[styles.label, selected && styles.selectedLabel]}>{item.label}</Text>
    </Pressable>
  </Link>;
}
function PageBoundary({ inactive, children }: { inactive: boolean; children: ReactNode }) {
  // aria-hidden alone does not remove offscreen controls from keyboard navigation.
  if (Platform.OS === 'web') return createElement('div', { inert: inactive, 'aria-hidden': inactive || undefined,
    style: { display: 'flex', flex: 1, minHeight: 0, minWidth: 0 } }, children);
  return <View style={styles.content} pointerEvents={inactive ? 'none' : 'auto'} accessibilityElementsHidden={inactive}
    importantForAccessibility={inactive ? 'no-hide-descendants' : 'auto'}>{children}</View>;
}

/** Only main pages participate; forms retain the existing stack and removal guards. */
export function MainNavigation({ current, renderPage }: { current: MainPath; renderPage: (page: MainPath) => ReactNode }) {
  const router = useRouter(), insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion(), reducedRef = useRef(reduced);
  const [translation] = useState(() => new Animated.Value(0));
  const [transitioning, setTransitioning] = useState(false);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const mounted = useRef(true), busy = useRef(false), gestureCanceled = useRef(false);
  const leaving = useRef<MainPath | null>(null);
  const index = destinations.findIndex(item => item.href === current), nativeDriver = Platform.OS !== 'web';
  const finishNavigation = () => {
    const target = leaving.current; leaving.current = null;
    // Keep the adjacent page filling the viewport until Router commits its replacement.
    if (target && mounted.current) router.replace(target);
  };
  useLayoutEffect(() => {
    mounted.current = true; reducedRef.current = reduced; gestureCanceled.current = true;
    const target = leaving.current;
    leaving.current = null; animation.current?.stop(); translation.setValue(0);
    busy.current = false; setTransitioning(false);
    if (target) router.replace(target);
    return () => { mounted.current = false; animation.current?.stop(); translation.stopAnimation(); };
  }, [current, width, reduced, translation, router]);
  const resetDrag = () => {
    if (reducedRef.current !== false) { translation.setValue(0); setTransitioning(false); return; }
    busy.current = true; setTransitioning(true);
    animation.current = Animated.timing(translation, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver, isInteraction: false });
    animation.current.start(({ finished }) => { if (finished && mounted.current) { busy.current = false; setTransitioning(false); } });
  };
  const cancelTransition = () => {
    leaving.current = null; gestureCanceled.current = true;
    animation.current?.stop(); translation.setValue(0); busy.current = false; setTransitioning(false);
  };
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => !busy.current && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 24 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8,
    onPanResponderGrant: () => { gestureCanceled.current = false; setTransitioning(true); },
    onPanResponderMove: (_, gesture) => {
      if (gesture.numberActiveTouches !== 1) { gestureCanceled.current = true; resetDrag(); return; }
      if (reducedRef.current !== false || busy.current || gestureCanceled.current) return;
      // Clamp at the ends instead of revealing an empty page.
      const hasNeighbor = !!destinations[index + (gesture.dx < 0 ? 1 : -1)];
      translation.setValue(hasNeighbor ? Math.max(-width, Math.min(width, gesture.dx)) : 0);
    },
    onPanResponderRelease: (_, gesture) => {
      const direction = gesture.dx < 0 ? 1 : -1, target = destinations[index + direction];
      if (gestureCanceled.current || !target || Math.abs(gesture.dx) < Math.min(100, Math.max(64, width * 0.2)) || Math.abs(gesture.dx) <= Math.abs(gesture.dy) * 1.8) { resetDrag(); return; }
      leaving.current = target.href;
      if (reducedRef.current !== false) { finishNavigation(); return; }
      busy.current = true; setTransitioning(true);
      animation.current = Animated.timing(translation, { toValue: -direction * width, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver, isInteraction: false });
      animation.current.start(({ finished }) => { if (finished && mounted.current) finishNavigation(); });
    },
    onPanResponderTerminate: () => { gestureCanceled.current = true; resetDrag(); },
    onPanResponderTerminationRequest: () => true,
  }), [index, router, width, translation, nativeDriver]);
  return <View style={styles.page}>
    <View style={[styles.content, styles.viewport, Platform.OS === 'web' && { touchAction: 'pan-y pinch-zoom' }]} {...responder.panHandlers}>
      <Animated.View nativeID="main-page-motion" style={[styles.track, { width: width * destinations.length, left: -index * width, transform: [{ translateX: translation }] }]}>
        {destinations.map(item => <View key={item.href} nativeID={`main-panel-${destinations.indexOf(item)}`} style={[styles.panel, { width }]}>
          <PageBoundary inactive={current !== item.href || transitioning}>
            {current === item.href ? renderPage(item.href) : <StaticMotion>{renderPage(item.href)}</StaticMotion>}
          </PageBoundary>
        </View>)}
      </Animated.View>
    </View>
    <View role={Platform.OS === 'web' ? 'navigation' : undefined} accessibilityLabel="Telas principais"
      style={[styles.bar, { paddingBottom: Math.max(8, insets.bottom), paddingLeft: Math.max(12, insets.left), paddingRight: Math.max(12, insets.right) }]}>
      <View style={styles.destinations}>{destinations.map(item => <Destination key={item.href} item={item} selected={current === item.href} onNavigate={cancelTransition} />)}</View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: visual.page }, content: { flex: 1, minHeight: 0 }, viewport: { overflow: 'hidden' },
  track: { position: 'absolute', top: 0, bottom: 0, flexDirection: 'row' }, panel: { height: '100%', backgroundColor: visual.page },
  bar: { backgroundColor: visual.surface, borderTopWidth: 1, borderTopColor: visual.separator, paddingTop: 8 },
  destinations: { flexDirection: 'row', gap: 4, width: '100%', maxWidth: 960, alignSelf: 'center' },
  destination: { flex: 1, minWidth: 0, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6, borderRadius: 16 },
  selected: { backgroundColor: visual.selected }, hover: { backgroundColor: visual.hover },
  icon: { width: 24, height: 24 }, label: { fontSize: 12, lineHeight: 18, color: visual.muted, textAlign: 'center' }, selectedLabel: { fontWeight: '700', color: visual.text },
});
