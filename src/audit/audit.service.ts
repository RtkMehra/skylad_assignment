import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, EntityType } from '../schemas/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  async log(
    userId: string,
    action: string,
    entityType: EntityType,
    entityId?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLogDocument> {
    return this.auditLogModel.create({
      at: new Date(),
      userId,
      action,
      entityType,
      entityId,
      metadata,
    });
  }
}

