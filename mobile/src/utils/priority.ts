import type { Priority } from '../types/task';
export const priorityLabel: Record<Priority, string> = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
export const priorityScore: Record<Priority, number> = { low: 10, medium: 20, high: 30 };