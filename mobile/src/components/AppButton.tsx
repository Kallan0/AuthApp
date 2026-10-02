import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { MotionPressable } from './Motion';

type Props = { title: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; style?: ViewStyle };
export function AppButton({ title, onPress, disabled, variant = 'primary', style }: Props) {
  const fill = variant === 'primary' ? colors.blue : variant === 'danger' ? colors.red : colors.paper;
  return <MotionPressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, { backgroundColor: fill }, disabled && styles.disabled, style]}>
    <Text style={[styles.text, { color: variant === 'secondary' ? colors.ink : colors.paper }]}>{title}</Text>
  </MotionPressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 52, borderWidth: 1, borderColor: colors.ink, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  text: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', letterSpacing: 0.7, textAlign: 'center' },
});
