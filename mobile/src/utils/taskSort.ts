import type { Task } from '../types/task';
import { priorityScore } from './priority';

export const taskScore = (task: Task, now = Date.now()) => {
  if (task.status === 'completed') return -1000;
  const deadlineHours = (new Date(task.deadline).getTime() - now) / 3600000;
  const scheduleHours = (new Date(task.scheduledAt).getTime() - now) / 3600000;
  const overdue = deadlineHours < 0 ? 50 : 0;
  const urgency = Math.max(0, 24 - Math.max(0, deadlineHours));
  const scheduled = Math.max(0, 12 - Math.max(0, scheduleHours));
  return priorityScore[task.priority] + overdue + urgency + scheduled;
};
export const sortTasks = (tasks: Task[], mode: 'smart' | 'date', now = Date.now()) => [...tasks].sort((a, b) =>
  mode === 'smart' ? taskScore(b, now) - taskScore(a, now) : Date.parse(a.deadline) - Date.parse(b.deadline)
);
