import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';
import { MotionView } from './Motion';
export function EmptyState({ title, message }: { title: string; message: string }) {
  return <MotionView style={styles.box}><Text style={styles.symbol}>□</Text><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text></MotionView>;
}
const styles = StyleSheet.create({
  box: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 32, alignItems: 'center', marginTop: 16 },
  symbol: { color: colors.blue, fontSize: 38 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 12 },
  message: { color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
