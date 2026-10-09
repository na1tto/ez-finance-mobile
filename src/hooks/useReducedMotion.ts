import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

const Preference = createContext<boolean | null>(null);

// One platform subscription for navigation and charts, including route changes.
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true, changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { changed = true; setReduced(value); });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active && !changed) setReduced(value); }).catch(() => { if (active && !changed) setReduced(true); });
    return () => { active = false; subscription.remove(); };
  }, []);
  return createElement(Preference.Provider, { value: reduced }, children);
}

export function useReducedMotion() { return useContext(Preference); }

// Complete previews without another platform listener or entrance animation.
export function StaticMotion({ children }: { children: ReactNode }) {
  return createElement(Preference.Provider, { value: true }, children);
}
