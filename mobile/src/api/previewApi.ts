import type { AuthResult, User } from '../types/auth';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../types/task';

const hour = 60 * 60 * 1000;
const iso = (offsetHours: number) => new Date(Date.now() + offsetHours * hour).toISOString();
let previewUser: User = { id: 'preview-user', name: 'Preview User', email: 'preview@illoca.app' };
let nextId = 5;
let tasks: Task[] = [
  {
    id: 'preview-1', title: 'Plan the week', description: 'List the three things to focus on first.',
    scheduledAt: iso(1), deadline: iso(8), priority: 'high', category: 'Personal',
    status: 'pending', completedAt: null, createdAt: iso(-2), updatedAt: iso(-2),
  },
  {
    id: 'preview-2', title: 'Review presentation', description: 'Check the final slides and speaker notes.',
    scheduledAt: iso(4), deadline: iso(28), priority: 'medium', category: 'Work',
    status: 'pending', completedAt: null, createdAt: iso(-5), updatedAt: iso(-5),
  },
  {
    id: 'preview-3', title: 'Pick up groceries', description: 'Milk, vegetables, and bread.',
    scheduledAt: iso(20), deadline: iso(32), priority: 'low', category: 'Personal',
    status: 'pending', completedAt: null, createdAt: iso(-6), updatedAt: iso(-6),
  },
  {
    id: 'preview-4', title: 'Clear the inbox', description: 'Reply to the messages that need an answer.',
    scheduledAt: iso(-24), deadline: iso(-8), priority: 'medium', category: 'Work',
    status: 'completed', completedAt: iso(-7), createdAt: iso(-30), updatedAt: iso(-7),
  },
];

const copy = (task: Task): Task => ({ ...task });
const find = (id: string) => {
  const task = tasks.find(item => item.id === id);
  if (!task) throw new Error('Task not found');
  return task;
};

export const previewApi = {
  user: () => ({ ...previewUser }),
  register: async (name: string, email: string): Promise<AuthResult> => {
    previewUser = { id: 'preview-user', name, email };
    return { user: { ...previewUser } };
  },
  login: async (email: string): Promise<AuthResult> => {
    previewUser = { id: 'preview-user', name: email.split('@')[0] || 'Preview User', email };
    return { user: { ...previewUser } };
  },
  me: async () => ({ ...previewUser }),
  list: async () => tasks.map(copy),
  get: async (id: string) => copy(find(id)),
  create: async (payload: CreateTaskPayload) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: 'preview-' + nextId++, title: payload.title, description: payload.description ?? '',
      scheduledAt: payload.scheduledAt, deadline: payload.deadline, priority: payload.priority,
      category: payload.category ?? null, status: 'pending', completedAt: null,
      createdAt: now, updatedAt: now,
    };
    tasks = [task, ...tasks];
    return copy(task);
  },
  update: async (id: string, payload: UpdateTaskPayload) => {
    const current = find(id);
    const updated: Task = {
      ...current, ...payload, category: payload.category === undefined ? current.category : payload.category,
      completedAt: payload.status === undefined ? current.completedAt : payload.status === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    tasks = tasks.map(item => item.id === id ? updated : item);
    return copy(updated);
  },
  complete: async (id: string) => {
    return previewApi.update(id, { status: 'completed' });
  },
  remove: async (id: string) => {
    find(id);
    tasks = tasks.filter(item => item.id !== id);
  },
};