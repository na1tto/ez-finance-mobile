import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';

type Bounds = { x: number; y: number; width: number; height: number };
export function createScrollViewport() {
  const listeners = new Set<() => void>();
  return {
    bounds: null as Bounds | null,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    notify() { listeners.forEach(listener => listener()); },
  };
}
export const ScrollViewport = createContext<ReturnType<typeof createScrollViewport> | null>(null);

/** Observe the plot itself, rather than its heading, without rendering on every scroll. */
export function useGraphVisibility() {
  const ref = useRef<View>(null);
  const viewport = useContext(ScrollViewport);
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const check = useRef<() => void>(() => {});
  useEffect(() => {
    let active = true;
    if (Platform.OS === 'web') {
      const element = ref.current as unknown as HTMLElement | null;
      if (!element) return;
      if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
      const observer = new IntersectionObserver(([entry]) => {
        if (active) setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      }, { threshold: [0, 0.25] });
      observer.observe(element);
      return () => { active = false; observer.disconnect(); };
    }
    check.current = () => ref.current?.measureInWindow((x, y, plotWidth, plotHeight) => {
      if (!active || !plotWidth || !plotHeight) return;
      const area = viewport?.bounds ?? { x: 0, y: 0, width, height };
      const overlapWidth = Math.max(0, Math.min(x + plotWidth, area.x + area.width) - Math.max(x, area.x));
      const overlapHeight = Math.max(0, Math.min(y + plotHeight, area.y + area.height) - Math.max(y, area.y));
      setVisible(overlapWidth * overlapHeight / (plotWidth * plotHeight) >= 0.25);
    });
    const unsubscribe = viewport?.subscribe(() => check.current());
    check.current();
    return () => { active = false; check.current = () => {}; unsubscribe?.(); };
  }, [viewport, width, height]);
  return { ref, visible, onLayout: () => check.current() };
}
