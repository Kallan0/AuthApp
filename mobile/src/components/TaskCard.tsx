import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Task } from '../types/task';
import { formatDate, isOverdue } from '../utils/date';
import { PriorityBadge } from './PriorityBadge';
import { MotionPressable, MotionView } from './Motion';

type Props = { task: Task; now: number; onOpen: () => void; onComplete: () => void; index?: number };
export function TaskCard({ task, now, onOpen, onComplete, index = 0 }: Props) {
  const done = task.status === 'completed';
  const overdue = isOverdue(task.deadline, task.status, now);
  return <MotionView delay={Math.min(index, 6) * 35}><MotionPressable onPress={onOpen} style={[styles.card, { borderLeftColor: done ? colors.border : task.priority === 'high' ? colors.red : colors.blue }]}>
    <View style={styles.top}>
      <PriorityBadge priority={task.priority} />
      <Text style={styles.date}>{formatDate(task.deadline)}</Text>
    </View>
    <View style={styles.row}>
      <MotionPressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={onComplete} selected={done} activeBackground={colors.blue} inactiveBackground={colors.paper} style={[styles.checkbox, done && styles.checked]}>
        <Text style={{ color: colors.paper }}>{done ? '✓' : ''}</Text>
      </MotionPressable>
      <View style={styles.content}>
        <Text style={[styles.title, done && styles.done]} numberOfLines={2}>{task.title}</Text>
        {task.description ? <Text style={styles.description} numberOfLines={2}>{task.description}</Text> : null}
      </View>
    </View>
    <View style={styles.footer}>
      <Text style={styles.meta}>{task.category || 'GENERAL'}</Text>
      <Text style={[styles.meta, overdue && { color: colors.red }]}>{done ? 'COMPLETED' : overdue ? 'OVERDUE' : 'PENDING'}</Text>
    </View>
  </MotionPressable></MotionView>;
}
const styles = StyleSheet.create({
  content: { flex: 1 },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, padding: 16, marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: 'monospace', fontSize: 11, color: colors.muted },
  row: { flexDirection: 'row', gap: 12, marginTop: 14 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  checked: { backgroundColor: colors.blue, borderColor: colors.blue },
  title: { color: colors.ink, fontSize: 19, fontWeight: '700', lineHeight: 24 },
  done: { textDecorationLine: 'line-through', color: colors.muted },
  description: { color: colors.muted, marginTop: 6, lineHeight: 19 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderColor: colors.border, paddingTop: 11 },
  meta: { color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5 },
});
