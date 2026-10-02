import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PriorityBadge } from '../../components/PriorityBadge';
import { MotionView } from '../../components/Motion';
import { colors } from '../../constants/colors';
import { getErrorMessage } from '../../api/client';
import { useTaskStore } from '../../store/taskStore';
import type { AppStackParamList } from '../../navigation/types';
import { formatDate, isOverdue } from '../../utils/date';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetails'>;
export function TaskDetailsScreen({ navigation, route }: Props) {
  const id = route.params.taskId;
  const { tasks, error: taskError, fetchTasks, completeTask, updateTask, deleteTask } = useTaskStore();
  const now = useTaskStore(state => state.now);
  const task = tasks.find(item => item.id === id);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => { if (!task) { fetchTasks().finally(() => setChecked(true)); } }, [task, fetchTasks]);
  const changeStatus = async () => {
    if (!task) return;
    setBusy(true);
    try {
      if (task.status === 'completed') await updateTask(id, { status: 'pending' });
      else await completeTask(id);
    } catch (error) { Alert.alert('Could not update task', getErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const remove = () => Alert.alert('Delete task?', 'This action cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      setBusy(true);
      try { await deleteTask(id); navigation.navigate('Home'); }
      catch (error) { Alert.alert('Could not delete task', getErrorMessage(error)); setBusy(false); }
    } },
  ]);
  if (!task && !checked) return <LoadingState />;
  if (!task && taskError) return <View style={styles.page}><ErrorState message={taskError} onRetry={() => { setChecked(false); fetchTasks().finally(() => setChecked(true)); }} /></View>;
  if (!task) return <View style={styles.page}><EmptyState title="Task unavailable" message="This task could not be found." /></View>;
  const overdue = isOverdue(task.deadline, task.status, now);
  return <MotionView style={styles.screen}><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.eyebrow}>TASK DETAILS</Text>
    <Text style={styles.title}>{task.title}</Text>
    <View style={styles.meta}><PriorityBadge priority={task.priority} /><Text style={[styles.status, overdue && { color: colors.red }]}>{task.status === 'completed' ? 'COMPLETED' : overdue ? 'OVERDUE' : 'PENDING'}</Text></View>
    <View style={styles.panel}><Text style={styles.label}>DESCRIPTION</Text><Text style={styles.value}>{task.description || 'No description added.'}</Text></View>
    <View style={styles.panel}><Text style={styles.label}>SCHEDULED</Text><Text style={styles.value}>{formatDate(task.scheduledAt)}</Text><View style={styles.rule} /><Text style={styles.label}>DEADLINE</Text><Text style={styles.value}>{formatDate(task.deadline)}</Text><View style={styles.rule} /><Text style={styles.label}>CATEGORY</Text><Text style={styles.value}>{task.category || 'General'}</Text></View>
    <AppButton title={busy ? 'UPDATING...' : task.status === 'completed' ? 'MARK AS PENDING' : 'MARK AS COMPLETE'} onPress={() => changeStatus()} disabled={busy} />
    <View style={styles.actions}><AppButton title="EDIT" variant="secondary" onPress={() => navigation.navigate('AddEditTask', { taskId: id })} disabled={busy} style={styles.actionButton} /><AppButton title="DELETE" variant="danger" onPress={remove} disabled={busy} style={styles.actionButton} /></View>
  </ScrollView></MotionView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  page: { backgroundColor: colors.canvas, padding: 18, flexGrow: 1, paddingBottom: 35 },
  eyebrow: { color: colors.blue, fontFamily: 'monospace', fontSize: 11, marginTop: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', marginTop: 12 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 22 },
  status: { color: colors.blue, fontFamily: 'monospace', fontWeight: '700', fontSize: 11 },
  panel: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 14 },
  label: { color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, marginBottom: 9 },
  value: { color: colors.ink, fontSize: 16, lineHeight: 23 },
  rule: { borderBottomWidth: 1, borderColor: colors.border, marginVertical: 16 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 9 },
  actionButton: { flex: 1 },
});
