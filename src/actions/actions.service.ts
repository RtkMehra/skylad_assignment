import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usage, UsageDocument } from '../schemas/usage.schema';
import { Document, DocumentDocument } from '../schemas/document.schema';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagDocument } from '../schemas/document-tag.schema';
import { RunActionDto, ScopeType } from './dto/run-action.dto';
import { AuditService } from '../audit/audit.service';
import { EntityType } from '../schemas/audit-log.schema';
import { DocumentsService } from '../documents/documents.service';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Usage.name) private usageModel: Model<UsageDocument>,
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(DocumentTag.name) private documentTagModel: Model<DocumentTagDocument>,
    private auditService: AuditService,
    private documentsService: DocumentsService,
  ) {}

  async runAction(userId: string, dto: RunActionDto): Promise<any> {
    if (dto.scope.type === ScopeType.FOLDER && dto.scope.ids && dto.scope.ids.length > 0) {
      throw new BadRequestException('Cannot use both folder scope and file IDs');
    }

    if (dto.scope.type === ScopeType.FILES && !dto.scope.ids) {
      throw new BadRequestException('File scope requires IDs');
    }

    if (dto.scope.type === ScopeType.FOLDER && !dto.scope.name) {
      throw new BadRequestException('Folder scope requires name');
    }

    let documents: DocumentDocument[] = [];
    if (dto.scope.type === ScopeType.FOLDER) {
      documents = await this.documentsService.getFolderDocuments(userId, dto.scope.name!);
    } else if (dto.scope.type === ScopeType.FILES && dto.scope.ids) {
      documents = await this.documentModel
        .find({
          _id: { $in: dto.scope.ids },
          ownerId: userId,
        })
        .exec();
    }

    if (documents.length === 0) {
      throw new NotFoundException('No documents found in scope');
    }

    const context = documents.map((doc) => ({
      title: doc.filename,
      content: doc.textContent.substring(0, 200),
    }));

    const results = this.mockProcessor(dto.messages, context, dto.actions);

    const createdDocuments: any[] = [];
    for (const action of dto.actions) {
      if (action === 'make_document') {
        const newDoc = await this.createGeneratedDocument(userId, results);
        createdDocuments.push(newDoc);
      } else if (action === 'make_csv') {
        const csvDoc = await this.createCsvDocument(userId, results);
        createdDocuments.push(csvDoc);
      }
    }

    await this.usageModel.create({
      userId,
      credits: 5,
      action: 'run_action',
    });

    await this.auditService.log(userId, 'action_run', EntityType.ACTION, undefined, {
      scope: dto.scope,
      actions: dto.actions,
    });

    return {
      success: true,
      createdDocuments,
      creditsUsed: 5,
    };
  }

  private mockProcessor(messages: any[], context: any[], actions: string[]): any {
    const contextSummary = context.map((c) => c.title).join(', ');
    const messageContent = messages.map((m) => m.content).join(' ');

    return {
      summary: `Processed ${context.length} documents: ${contextSummary}`,
      message: messageContent,
      timestamp: new Date().toISOString(),
      data: context.map((c, i) => ({
        id: i + 1,
        title: c.title,
        value: Math.floor(Math.random() * 1000),
      })),
    };
  }

  private async createGeneratedDocument(userId: string, results: any): Promise<DocumentDocument> {
    const textContent = `Generated Document\n\n${results.summary}\n\n${results.message}\n\nGenerated at: ${results.timestamp}`;
    return this.documentModel.create({
      ownerId: userId,
      filename: `generated-${Date.now()}.txt`,
      mime: 'text/plain',
      textContent,
    });
  }

  private async createCsvDocument(userId: string, results: any): Promise<DocumentDocument> {
    const csvData = stringify(results.data, {
      header: true,
      columns: ['id', 'title', 'value'],
    });

    return this.documentModel.create({
      ownerId: userId,
      filename: `generated-${Date.now()}.csv`,
      mime: 'text/csv',
      textContent: csvData,
    });
  }

  async getUsageForMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const usages = await this.usageModel
      .find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    return usages.reduce((total, usage) => total + usage.credits, 0);
  }
}

