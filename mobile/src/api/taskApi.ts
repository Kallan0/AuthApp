import { client } from './client';
import { previewApi } from './previewApi';
import { PREVIEW_MODE } from '../constants/config';
import type { ApiSuccess } from '../types/api';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../types/task';

export const taskApi = {
  async list() {
    if (PREVIEW_MODE) return previewApi.list();
    const response = await client.get<ApiSuccess<Task[]>>('/tasks');
    return response.data.data;
  },
  async get(id: string) {
    if (PREVIEW_MODE) return previewApi.get(id);
    const response = await client.get<ApiSuccess<Task>>('/tasks/' + id);
    return response.data.data;
  },
  async create(payload: CreateTaskPayload) {
    if (PREVIEW_MODE) return previewApi.create(payload);
    const response = await client.post<ApiSuccess<Task>>('/tasks', payload);
    return response.data.data;
  },
  async update(id: string, payload: UpdateTaskPayload) {
    if (PREVIEW_MODE) return previewApi.update(id, payload);
    const response = await client.patch<ApiSuccess<Task>>('/tasks/' + id, payload);
    return response.data.data;
  },
  async complete(id: string) {
    if (PREVIEW_MODE) return previewApi.complete(id);
    const response = await client.patch<ApiSuccess<Task>>('/tasks/' + id + '/complete');
    return response.data.data;
  },
  async remove(id: string) {
    if (PREVIEW_MODE) return previewApi.remove(id);
    await client.delete('/tasks/' + id);
  },
};