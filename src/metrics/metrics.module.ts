import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Document, DocumentSchema } from '../schemas/document.schema';
import { Tag, TagSchema } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagSchema } from '../schemas/document-tag.schema';
import { Usage, UsageSchema } from '../schemas/usage.schema';
import { Task, TaskSchema } from '../schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
      { name: Tag.name, schema: TagSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
      { name: Usage.name, schema: UsageSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}

