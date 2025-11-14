import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum EntityType {
  DOCUMENT = 'document',
  TAG = 'tag',
  ACTION = 'action',
  WEBHOOK = 'webhook',
  TASK = 'task',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, default: Date.now })
  at: Date;

  @Prop({ required: true, type: String, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true, enum: EntityType })
  entityType: EntityType;

  @Prop({ type: String })
  entityId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1, at: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

