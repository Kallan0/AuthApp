import { create } from 'zustand';
import { taskApi } from '../api/taskApi';
import { getErrorMessage } from '../api/client';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../types/task';

type TaskState = {
  tasks: Task[];
  now: number;
  isLoading: boolean;
  error: string | null;
  tick: () => void;
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clear: () => void;
};

let sessionGeneration = 0;
let latestFetch = 0;
export const useTaskStore = create<TaskState>((set) => ({
  tasks: [], now: Date.now(), isLoading: false, error: null,
  tick: () => set({ now: Date.now() }),
  clear: () => {
    sessionGeneration++;
    latestFetch++;
    set({ tasks: [], now: Date.now(), error: null, isLoading: false });
  },
  fetchTasks: async () => {
    const generation = sessionGeneration;
    const request = ++latestFetch;
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskApi.list();
      if (generation === sessionGeneration && request === latestFetch) set({ tasks, isLoading: false });
    } catch (error) {
      if (generation === sessionGeneration && request === latestFetch) {
        set({ error: getErrorMessage(error), isLoading: false });
      }
    }
  },
  createTask: async payload => {
    const generation = sessionGeneration;
    const task = await taskApi.create(payload);
    if (generation === sessionGeneration) set(state => ({ tasks: [task, ...state.tasks] }));
    return task;
  },
  updateTask: async (id, payload) => {
    const generation = sessionGeneration;
    const task = await taskApi.update(id, payload);
    if (generation === sessionGeneration) set(state => ({ tasks: state.tasks.map(item => item.id === id ? task : item) }));
    return task;
  },
  completeTask: async id => {
    const generation = sessionGeneration;
    const task = await taskApi.complete(id);
    if (generation === sessionGeneration) set(state => ({ tasks: state.tasks.map(item => item.id === id ? task : item) }));
  },
  deleteTask: async id => {
    const generation = sessionGeneration;
    await taskApi.remove(id);
    if (generation === sessionGeneration) set(state => ({ tasks: state.tasks.filter(item => item.id !== id) }));
  },
}));
