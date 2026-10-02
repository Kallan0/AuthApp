import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../constants/colors';
import { useReducedMotion } from './Motion';
import { MotionView } from './Motion';

type Props = TextInputProps & { label: string; error?: string };
export function AppInput({ label, error, style, onFocus, onBlur, ...props }: Props) {
  const reducedMotion = useReducedMotion();
  const focus = useRef(new Animated.Value(0)).current;
  const animateFocus = (toValue: number) => {
    if (reducedMotion) { focus.setValue(toValue); return; }
    Animated.timing(focus, { toValue, duration: 170, useNativeDriver: true }).start();
  };
  return <View style={styles.group}>
    <Text style={styles.label}>{label.toUpperCase()}</Text>
    <View>
      <TextInput placeholderTextColor={colors.muted} {...props}
        onFocus={event => { animateFocus(1); onFocus?.(event); }}
        onBlur={event => { animateFocus(0); onBlur?.(event); }}
        style={[styles.input, style]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.focusBorder, { opacity: focus }]} />
    </View>
    {error ? <MotionView duration={160}><Text style={styles.error}>{error}</Text></MotionView> : null}
  </View>;
}
const styles = StyleSheet.create({
  group: { marginBottom: 18 },
  label: { color: colors.muted, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: colors.paper, color: colors.ink, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, minHeight: 50, fontSize: 16 },
  focusBorder: { borderWidth: 1, borderColor: colors.blue },
  error: { color: colors.red, marginTop: 5, fontSize: 12 },
});
