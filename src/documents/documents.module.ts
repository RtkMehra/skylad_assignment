import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController, FoldersController } from './documents.controller';
import { SearchController } from './search.controller';
import { DocumentsService } from './documents.service';
import { Document, DocumentSchema } from '../schemas/document.schema';
import { Tag, TagSchema } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagSchema } from '../schemas/document-tag.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
      { name: Tag.name, schema: TagSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
    ]),
    AuditModule,
  ],
  controllers: [DocumentsController, FoldersController, SearchController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}

