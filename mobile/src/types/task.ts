export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type Task = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  deadline: string;
  priority: Priority;
  category: string | null;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateTaskPayload = {
  title: string;
  description?: string;
  scheduledAt: string;
  deadline: string;
  priority: Priority;
  category?: string | null;
};
export type UpdateTaskPayload = Partial<CreateTaskPayload> & { status?: TaskStatus };