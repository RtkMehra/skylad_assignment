import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from '../schemas/task.schema';
import { OcrWebhookDto } from './dto/ocr-webhook.dto';
import { AuditService } from '../audit/audit.service';
import { EntityType } from '../schemas/audit-log.schema';

export enum ContentClassification {
  OFFICIAL = 'official',
  AD = 'ad',
  UNKNOWN = 'unknown',
}

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private auditService: AuditService,
  ) {}

  async processOcrWebhook(userId: string, dto: OcrWebhookDto): Promise<any> {
    const classification = this.classifyContent(dto.text);

    await this.auditService.log(userId, 'webhook_received', EntityType.WEBHOOK, dto.imageId, {
      source: dto.source,
      classification,
      textLength: dto.text.length,
    });

    const result: any = {
      imageId: dto.imageId,
      classification,
      processed: false,
    };

    if (classification === ContentClassification.AD) {
      const unsubscribeInfo = this.extractUnsubscribeInfo(dto.text);

      if (unsubscribeInfo) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingTasksCount = await this.taskModel.countDocuments({
          userId,
          channel: dto.source,
          createdAt: { $gte: today, $lt: tomorrow },
        });

        if (existingTasksCount < 3) {
          const task = await this.taskModel.create({
            userId,
            status: TaskStatus.PENDING,
            channel: dto.source,
            target: unsubscribeInfo,
            metadata: {
              imageId: dto.imageId,
              text: dto.text.substring(0, 200),
              ...dto.meta,
            },
          });

          await this.auditService.log(userId, 'task_created', EntityType.TASK, task._id.toString(), {
            channel: dto.source,
            target: unsubscribeInfo,
          });

          result.processed = true;
          result.taskId = task._id.toString();
        } else {
          result.processed = false;
          result.reason = 'Rate limit exceeded: maximum 3 tasks per sender per day';
        }
      }
    }

    return result;
  }

  private classifyContent(text: string): ContentClassification {
    const lowerText = text.toLowerCase();

    // Financial/legal terms
    const officialTerms = [
      'contract',
      'agreement',
      'invoice',
      'receipt',
      'legal',
      'terms and conditions',
      'warranty',
      'policy',
      'compliance',
      'regulation',
    ];

    // Promotional terms
    const adTerms = [
      'sale',
      'discount',
      'limited time',
      'unsubscribe',
      'promotion',
      'offer',
      'deal',
      'special',
      'buy now',
      'act now',
    ];

    const hasOfficialTerms = officialTerms.some((term) => lowerText.includes(term));
    const hasAdTerms = adTerms.some((term) => lowerText.includes(term));

    if (hasOfficialTerms) {
      return ContentClassification.OFFICIAL;
    }
    if (hasAdTerms) {
      return ContentClassification.AD;
    }
    return ContentClassification.UNKNOWN;
  }

  private extractUnsubscribeInfo(text: string): string | null {
    const unsubscribePatterns = [
      /unsubscribe[:\s]+(?:mailto:)?([^\s<>]+@[^\s<>]+)/i,
      /unsubscribe[:\s]+(https?:\/\/[^\s<>]+)/i,
      /mailto:([^\s<>]+@[^\s<>]+)/i,
    ];

    for (const pattern of unsubscribePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }
}

