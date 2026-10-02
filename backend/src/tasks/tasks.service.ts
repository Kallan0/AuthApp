import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task, TaskDocument } from './schemas/task.schema.js';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly tasks: Model<Task>) {}

  private serialize(task: TaskDocument) {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      scheduledAt: task.scheduledAt.toISOString(),
      deadline: task.deadline.toISOString(),
      priority: task.priority,
      category: task.category,
      status: task.status,
      completedAt: task.completedAt?.toISOString() ?? null,
      createdAt: task.get('createdAt') as Date,
      updatedAt: task.get('updatedAt') as Date,
    };
  }

  private checkDates(scheduledAt: Date, deadline: Date) {
    if (Number.isNaN(scheduledAt.valueOf()) || Number.isNaN(deadline.valueOf()) || deadline < scheduledAt) {
      throw new BadRequestException('Deadline must be on or after the scheduled date');
    }
  }

  private async owned(id: string, userId: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Task not found');
    const task = await this.tasks.findOne({ _id: id, userId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async list(userId: string) {
    const tasks = await this.tasks.find({ userId }).sort({ deadline: 1, createdAt: -1 }).exec();
    return tasks.map(task => this.serialize(task));
  }

  async get(id: string, userId: string) {
    return this.serialize(await this.owned(id, userId));
  }

  async create(dto: CreateTaskDto, userId: string) {
    const scheduledAt = new Date(dto.scheduledAt);
    const deadline = new Date(dto.deadline);
    this.checkDates(scheduledAt, deadline);
    const task = await this.tasks.create({
      userId: new Types.ObjectId(userId),
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      scheduledAt, deadline,
      priority: dto.priority,
      category: dto.category?.trim() || null,
    });
    return this.serialize(task);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.owned(id, userId);
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : task.scheduledAt;
    const deadline = dto.deadline ? new Date(dto.deadline) : task.deadline;
    this.checkDates(scheduledAt, deadline);
    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description.trim();
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.category !== undefined) task.category = dto.category?.trim() || null;
    task.scheduledAt = scheduledAt;
    task.deadline = deadline;
    if (dto.status !== undefined) {
      task.status = dto.status;
      task.completedAt = dto.status === 'completed' ? new Date() : null;
    }
    await task.save();
    return this.serialize(task);
  }

  async complete(id: string, userId: string) {
    const task = await this.owned(id, userId);
    if (task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
    }
    return this.serialize(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.owned(id, userId);
    await task.deleteOne();
    return null;
  }
}