import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { TaskCard } from '../../components/TaskCard';
import { MotionPressable, MotionView } from '../../components/Motion';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import type { AppStackParamList } from '../../navigation/types';
import { isOverdue } from '../../utils/date';
import { sortTasks } from '../../utils/taskSort';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;
type Filter = 'all' | 'pending' | 'completed';
export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore(state => state.user);
  const { tasks, isLoading, error, fetchTasks, completeTask, updateTask } = useTaskStore();
  const now = useTaskStore(state => state.now);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<'smart' | 'date'>('smart');
  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));
  const shown = useMemo(() => sortTasks(tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [task.title, task.description, task.category ?? ''].some(value => value.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  }), sort, now), [tasks, filter, search, sort, now]);
  const pending = tasks.filter(task => task.status === 'pending').length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const overdue = tasks.filter(task => isOverdue(task.deadline, task.status, now)).length;
  const toggle = async (id: string, status: string) => {
    try {
      if (status === 'completed') await updateTask(id, { status: 'pending' });
      else await completeTask(id);
    } catch (failure) { Alert.alert('Could not update task', getErrorMessage(failure)); }
  };
  return <MotionView style={styles.page}><SafeAreaView style={styles.page} edges={['top', 'bottom']}>
    <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchTasks()} tintColor={colors.blue} />} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <Text style={styles.brand}>▣  ILLOCA</Text>
        <MotionPressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
          <View style={styles.profileHead} />
          <View style={styles.profileShoulders} />
        </MotionPressable>
      </View>
      
      <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
      <Text style={styles.heading}>Hello, {user?.name?.split(' ')[0] || 'there'}.</Text>
      <Text style={styles.subheading}>Keep your next steps in view.</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statLabel}>PENDING</Text><Text style={styles.statNumber}>{pending}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>OVERDUE</Text><Text style={[styles.statNumber, { color: colors.red }]}>{overdue}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>DONE</Text><Text style={styles.statNumber}>{completed}</Text></View>
      </View>
      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Your tasks</Text><Text style={styles.count}>{tasks.length} TOTAL</Text></View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search tasks" placeholderTextColor={colors.muted} style={styles.search} />
      <View style={styles.filters}>
        {(['all', 'pending', 'completed'] as const).map(item => <MotionPressable key={item} onPress={() => setFilter(item)} selected={filter === item} activeBackground={colors.blue} inactiveBackground={colors.paper} style={[styles.chip, filter === item && styles.chipActive]}><Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item.toUpperCase()}</Text></MotionPressable>)}
      </View>
      <View style={styles.sortRow}><Text style={styles.sortLabel}>SORT BY</Text><MotionPressable onPress={() => setSort(sort === 'smart' ? 'date' : 'smart')}><Text style={styles.sortAction}>{sort === 'smart' ? 'SMART PRIORITY' : 'DEADLINE'}  ↕</Text></MotionPressable></View>
      {error ? <ErrorState message={error} onRetry={() => fetchTasks()} /> : shown.length ? shown.map((task, index) => <TaskCard key={task.id} task={task} now={now} index={index} onOpen={() => navigation.navigate('TaskDetails', { taskId: task.id })} onComplete={() => toggle(task.id, task.status)} />) : !isLoading ? <EmptyState title={search || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'} message={search || filter !== 'all' ? 'Try a different search or filter.' : 'Create your first task to get started.'} /> : null}
    </ScrollView>
    <View style={styles.bottom}><AppButton title="+  NEW TASK" onPress={() => navigation.navigate('AddEditTask')} /></View>
  </SafeAreaView></MotionView>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 18, paddingBottom: 24 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  brand: { color: colors.ink, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1, fontSize: 15 },
  profileButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, borderRadius: 22 },
  profileHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue, marginTop: 2 },
  profileShoulders: { width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: colors.blue, marginTop: 3 },
  eyebrow: { color: colors.blue, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.4 },
  heading: { color: colors.ink, fontSize: 32, fontWeight: '800', marginTop: 8 },
  subheading: { color: colors.muted, fontSize: 15, marginTop: 5 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 27, marginBottom: 34 },
  stat: { flex: 1, backgroundColor: colors.paper, borderTopWidth: 3, borderTopColor: colors.blue, borderWidth: 1, borderColor: colors.border, padding: 12 },
  statLabel: { color: colors.muted, fontFamily: 'monospace', fontSize: 10 },
  statNumber: { color: colors.ink, fontWeight: '800', fontSize: 26, marginTop: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  sectionTitle: { color: colors.ink, fontSize: 23, fontWeight: '800' },
  count: { color: colors.muted, fontFamily: 'monospace', fontSize: 10 },
  search: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 48, color: colors.ink, marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  chip: { paddingVertical: 10, paddingHorizontal: 11, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipText: { color: colors.muted, fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  chipTextActive: { color: colors.paper },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sortLabel: { color: colors.muted, fontFamily: 'monospace', fontSize: 10 },
  sortAction: { color: colors.blue, fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  bottom: { padding: 16, backgroundColor: colors.canvas, borderTopWidth: 1, borderColor: colors.border },
});
