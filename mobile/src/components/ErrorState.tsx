import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';
import { AppButton } from './AppButton';
import { MotionView } from './Motion';
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <MotionView style={styles.box}><Text style={styles.message}>{message}</Text><AppButton title="TRY AGAIN" onPress={onRetry} /></MotionView>;
}
const styles = StyleSheet.create({ box: { padding: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, gap: 14 }, message: { color: colors.red, fontSize: 15, lineHeight: 21 } });
