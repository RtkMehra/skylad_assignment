import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, type: String, ref: 'User' })
  userId: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Prop({ required: true })
  channel: string;

  @Prop({ required: true })
  target: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, channel: 1, createdAt: -1 });

