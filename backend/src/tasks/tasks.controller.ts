import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserData } from '../common/decorators/current-user.decorator.js';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
@UseGuards(FirebaseAuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}
  @Get() list(@CurrentUser() user: CurrentUserData) { return this.tasks.list(user.id); }
  @Get(':id') get(@Param('id') id: string, @CurrentUser() user: CurrentUserData) { return this.tasks.get(id, user.id); }
  @Post() create(@Body() dto: CreateTaskDto, @CurrentUser() user: CurrentUserData) { return this.tasks.create(dto, user.id); }
  @Patch(':id/complete') complete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) { return this.tasks.complete(id, user.id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: CurrentUserData) { return this.tasks.update(id, user.id, dto); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) { return this.tasks.remove(id, user.id); }
}
