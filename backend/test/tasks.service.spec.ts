import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Model } from 'mongoose';
import { TasksService } from '../src/tasks/tasks.service.js';
import { Task } from '../src/tasks/schemas/task.schema.js';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto.js';

describe('task ownership and validation', () => {
  it('scopes task lookup to the authenticated user', async () => {
    const findOne = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
    const service = new TasksService({ findOne } as unknown as Model<Task>);
    const id = '507f1f77bcf86cd799439011';
    await expect(service.get(id, 'owner-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(findOne).toHaveBeenCalledWith({ _id: id, userId: 'owner-id' });
  });

  it('rejects a deadline before the scheduled time before writing', async () => {
    const create = vi.fn();
    const service = new TasksService({ create } as unknown as Model<Task>);
    await expect(service.create({
      title: 'Task',
      scheduledAt: '2026-10-02T10:00:00.000Z',
      deadline: '2026-10-01T10:00:00.000Z',
      priority: 'medium',
    }, '507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a client supplied owner field', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Task',
      scheduledAt: '2026-10-01T10:00:00.000Z',
      deadline: '2026-10-02T10:00:00.000Z',
      priority: 'medium',
      userId: 'someone-else',
    });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.some(error => error.property === 'userId')).toBe(true);
  });
});