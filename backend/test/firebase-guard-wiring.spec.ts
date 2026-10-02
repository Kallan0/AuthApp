import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FirebaseAuthService } from '../src/auth/firebase-auth.service.js';
import { FirebaseAuthGuard } from '../src/auth/guards/firebase-auth.guard.js';
import { TasksModule } from '../src/tasks/tasks.module.js';
import { Task } from '../src/tasks/schemas/task.schema.js';
import { User } from '../src/users/schemas/user.schema.js';

describe('Firebase guard module wiring', () => {
  it('resolves the task guard with its Firebase service dependency', async () => {
    const module = await Test.createTestingModule({ imports: [TasksModule] })
      .overrideProvider(getModelToken(Task.name)).useValue({})
      .overrideProvider(getModelToken(User.name)).useValue({})
      .overrideProvider(FirebaseAuthService).useValue({ authenticate: vi.fn() })
      .compile();

    expect(module.select(TasksModule).get(FirebaseAuthGuard, { strict: true })).toBeInstanceOf(FirebaseAuthGuard);
    await module.close();
  });
});
