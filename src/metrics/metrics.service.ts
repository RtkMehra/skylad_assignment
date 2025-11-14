import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from '../schemas/document.schema';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagDocument } from '../schemas/document-tag.schema';
import { Usage, UsageDocument } from '../schemas/usage.schema';
import { Task, TaskDocument } from '../schemas/task.schema';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(DocumentTag.name) private documentTagModel: Model<DocumentTagDocument>,
    @InjectModel(Usage.name) private usageModel: Model<UsageDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async getMetrics(): Promise<any> {
    const docsTotal = await this.documentModel.countDocuments().exec();
    
    // Count unique primary tags (folders)
    const foldersTotal = await this.documentTagModel
      .distinct('tagId', { isPrimary: true })
      .exec()
      .then((tags) => tags.length);

    // Actions this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actionsMonth = await this.usageModel
      .countDocuments({
        createdAt: { $gte: startOfMonth },
      })
      .exec();

    // Tasks today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tasksToday = await this.taskModel
      .countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      })
      .exec();

    return {
      docs_total: docsTotal,
      folders_total: foldersTotal,
      actions_month: actionsMonth,
      tasks_today: tasksToday,
    };
  }
}

