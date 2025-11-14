import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { Usage, UsageSchema } from '../schemas/usage.schema';
import { Document, DocumentSchema } from '../schemas/document.schema';
import { Tag, TagSchema } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagSchema } from '../schemas/document-tag.schema';
import { AuditModule } from '../audit/audit.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usage.name, schema: UsageSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: Tag.name, schema: TagSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
    ]),
    AuditModule,
    DocumentsModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}

