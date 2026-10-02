import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) userId: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 120 }) title: string;
  @Prop({ default: '', maxlength: 2000 }) description: string;
  @Prop({ required: true }) scheduledAt: Date;
  @Prop({ required: true }) deadline: Date;
  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' }) priority: Priority;
  @Prop({ type: String, default: null, maxlength: 60 }) category: string | null;
  @Prop({ type: String, enum: ['pending', 'completed'], default: 'pending' }) status: TaskStatus;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
}
export type TaskDocument = HydratedDocument<Task>;
export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, deadline: 1 });