import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';
import type { Priority } from '../types/task';
import { priorityLabel } from '../utils/priority';
import { MotionView } from './Motion';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const urgent = priority === 'high';
  return <MotionView key={priority} duration={180} style={[styles.badge, { backgroundColor: urgent ? colors.red : priority === 'medium' ? colors.blue : colors.panel }]}>
    <Text style={[styles.text, { color: priority === 'low' ? colors.ink : colors.paper }]}>{priorityLabel[priority]}</Text>
  </MotionView>;
}
const styles = StyleSheet.create({
  badge: { paddingVertical: 5, paddingHorizontal: 8, alignSelf: 'flex-start' },
  text: { fontFamily: 'monospace', fontWeight: '700', fontSize: 10, letterSpacing: 0.5 },
});
