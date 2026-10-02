import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types/task';

const alertKey = (task: Task) => task.id + ':' + task.deadline;

export function DeadlineAlerts() {
  const userId = useAuthStore(state => state.user?.id);
  const tasks = useTaskStore(state => state.tasks);
  const nowTick = useTaskStore(state => state.now);
  const isLoading = useTaskStore(state => state.isLoading);
  const fetchTasks = useTaskStore(state => state.fetchTasks);
  const tick = useTaskStore(state => state.tick);
  const notified = useRef(new Set<string>());
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(AppState.currentState !== 'background');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setReady(false);
    notified.current = new Set();
    AsyncStorage.getItem('illoca.deadline-alerts:' + userId)
      .then(value => {
        if (!cancelled) notified.current = new Set(value ? JSON.parse(value) as string[] : []);
      })
      .catch(() => { /* Continue with one alert per task for this session. */ })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      const isActive = state === 'active';
      setActive(isActive);
      if (isActive) { tick(); fetchTasks(); }
    });
    return () => listener.remove();
  }, [fetchTasks, tick]);

  useEffect(() => {
    if (!userId || !ready || !active || isLoading) return;
    const now = Date.now();
    const pending = tasks.filter(task => task.status === 'pending');
    const overdue = pending.filter(task => {
      const deadline = Date.parse(task.deadline);
      return Number.isFinite(deadline) && deadline <= now && !notified.current.has(alertKey(task));
    });
    if (overdue.length) {
      for (const task of overdue) notified.current.add(alertKey(task));
      AsyncStorage.setItem(
        'illoca.deadline-alerts:' + userId,
        JSON.stringify([...notified.current]),
      ).catch(() => {});
      const title = overdue.length === 1 ? 'Deadline passed' : overdue.length + ' deadlines passed';
      const message = overdue.length === 1
        ? 'The deadline for "' + overdue[0].title + '" has passed.'
        : overdue.slice(0, 3).map(task => '- ' + task.title).join('\n')
          + (overdue.length > 3 ? '\n...and ' + (overdue.length - 3) + ' more.' : '');
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
    const next = pending
      .map(task => Date.parse(task.deadline))
      .filter(deadline => Number.isFinite(deadline) && deadline > now)
      .sort((a, b) => a - b)[0];
    if (next === undefined) return;
    const timer = setTimeout(tick, Math.min(next - now + 100, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [active, nowTick, isLoading, ready, tasks, tick, userId]);

  return null;
}
