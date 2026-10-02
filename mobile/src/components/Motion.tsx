import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

const ReducedMotionContext = createContext(false);
export const useReducedMotion = () => useContext(ReducedMotionContext);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription.remove();
  }, []);
  return <ReducedMotionContext.Provider value={reducedMotion}>{children}</ReducedMotionContext.Provider>;
}

export function MotionView({ children, style, delay = 0, duration = 260 }: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
}) {
  const reducedMotion = useContext(ReducedMotionContext);
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1, duration, delay, useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress, reducedMotion]);
  return <Animated.View style={[style, {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  }]}>{children}</Animated.View>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type MotionPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  activeBackground?: string;
  inactiveBackground?: string;
};

export function MotionPressable({ style, onPressIn, onPressOut, children, selected, activeBackground, inactiveBackground, ...props }: MotionPressableProps) {
  const reducedMotion = useContext(ReducedMotionContext);
  const scale = useRef(new Animated.Value(1)).current;
  const selection = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const hasSelection = selected !== undefined && !!activeBackground && !!inactiveBackground;
  useEffect(() => {
    if (!hasSelection) return;
    if (reducedMotion) { selection.setValue(selected ? 1 : 0); return; }
    const animation = Animated.timing(selection, { toValue: selected ? 1 : 0, duration: 180, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [hasSelection, reducedMotion, selected, selection]);
  const animate = (toValue: number) => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue, speed: 28, bounciness: 3, useNativeDriver: true }).start();
  };
  return <AnimatedPressable
    {...props}
    onPressIn={event => { animate(0.97); onPressIn?.(event); }}
    onPressOut={event => { animate(1); onPressOut?.(event); }}
    style={[style, hasSelection && styles.clip, hasSelection && { backgroundColor: inactiveBackground }, { transform: [{ scale }] }]}
  >
    {hasSelection ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: activeBackground, opacity: selection }]} /> : null}
    {children}
  </AnimatedPressable>;
}

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
