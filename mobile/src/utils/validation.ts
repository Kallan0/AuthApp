import { z } from 'zod';

export const authSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
});
export const registerSchema = authSchema.extend({ name: z.string().trim().min(2, 'Enter your name').max(80) });
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(120),
  description: z.string().max(2000),
  category: z.string().max(60),
});