import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document, DocumentDocument } from '../schemas/document.schema';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { DocumentTag, DocumentTagDocument } from '../schemas/document-tag.schema';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { SearchDocumentsDto, SearchScope } from './dto/search-documents.dto';
import { AuditService } from '../audit/audit.service';
import { EntityType } from '../schemas/audit-log.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(DocumentTag.name) private documentTagModel: Model<DocumentTagDocument>,
    private auditService: AuditService,
  ) { }

  async uploadDocument(userId: string, dto: UploadDocumentDto): Promise<DocumentDocument> {
    let primaryTag = await this.tagModel.findOne({ name: dto.primaryTag, ownerId: userId });
    if (!primaryTag) {
      primaryTag = await this.tagModel.create({ name: dto.primaryTag, ownerId: userId });
      await this.auditService.log(userId, 'tag_created', EntityType.TAG, primaryTag._id.toString());
    }

    const document = await this.documentModel.create({
      ownerId: userId,
      filename: dto.filename,
      mime: dto.mime,
      textContent: dto.textContent,
    });

    await this.documentTagModel.create({
      documentId: document._id.toString(),
      tagId: primaryTag._id.toString(),
      isPrimary: true,
    });

    if (dto.secondaryTags && dto.secondaryTags.length > 0) {
      for (const tagName of dto.secondaryTags) {
        let tag = await this.tagModel.findOne({ name: tagName, ownerId: userId });
        if (!tag) {
          tag = await this.tagModel.create({ name: tagName, ownerId: userId });
          await this.auditService.log(userId, 'tag_created', EntityType.TAG, tag._id.toString());
        }
        await this.documentTagModel.create({
          documentId: document._id.toString(),
          tagId: tag._id.toString(),
          isPrimary: false,
        });
      }
    }

    await this.auditService.log(userId, 'document_uploaded', EntityType.DOCUMENT, document._id.toString(), {
      filename: dto.filename,
      primaryTag: dto.primaryTag,
    });

    return document;
  }

  async getFolders(userId: string): Promise<Array<{ id: string; name: string; count: number }>> {
    const userDocuments = await this.documentModel
      .find({ ownerId: userId })
      .select('_id')
      .exec();

    if (userDocuments.length === 0) {
      return [];
    }

    const documentIds = userDocuments.map((doc) => doc._id.toString());

    const primaryDocumentTags = await this.documentTagModel
      .find({
        isPrimary: true,
        documentId: { $in: documentIds },
      })
      .select('tagId')
      .exec();

    if (primaryDocumentTags.length === 0) {
      return [];
    }

    const tagIds = [...new Set(primaryDocumentTags.map((dt) => dt.tagId))];
    const tags = await this.tagModel.find({ _id: { $in: tagIds } }).exec();

    const folderMap = new Map<string, { id: string; count: number }>();
    for (const dt of primaryDocumentTags) {
      const tag = tags.find((t) => t._id.toString() === dt.tagId);
      if (tag) {
        const existing = folderMap.get(tag.name);
        if (existing) {
          existing.count += 1;
        } else {
          folderMap.set(tag.name, { id: tag._id.toString(), count: 1 });
        }
      }
    }

    const folders = Array.from(folderMap.entries())
      .map(([name, data]) => ({ id: data.id, name, count: data.count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return folders;
  }

  async getFolderDocuments(userId: string, tagIdentifier: string): Promise<DocumentDocument[]> {
    let tag = null;

    if (Types.ObjectId.isValid(tagIdentifier)) {
      tag = await this.tagModel.findOne({ _id: tagIdentifier, ownerId: userId });
    }

    if (!tag) {
      tag = await this.tagModel.findOne({ name: tagIdentifier, ownerId: userId });
    }

    if (!tag) {
      throw new NotFoundException(`Tag "${tagIdentifier}" not found`);
    }

    const primaryDocumentTags = await this.documentTagModel.find({
      tagId: tag._id.toString(),
      isPrimary: true,
    });

    const documentIds = primaryDocumentTags.map((dt) => dt.documentId);
    const documents = await this.documentModel
      .find({
        _id: { $in: documentIds },
        ownerId: userId,
      })
      .sort({ createdAt: -1 })
      .exec();

    return documents;
  }

  async searchDocuments(userId: string, dto: SearchDocumentsDto): Promise<DocumentDocument[]> {
    const { q, scope, ids } = dto;

    // Validate scope rule: either folder or files, not both
    if (scope === SearchScope.FOLDER && ids && ids.length > 0) {
      throw new BadRequestException('Cannot use both folder scope and file IDs');
    }

    let query: any = {
      ownerId: userId,
      $text: { $search: q },
    };

    if (scope === SearchScope.FILES && ids && ids.length > 0) {
      query._id = { $in: ids };
    } else if (scope === SearchScope.FOLDER) {
      const userDocumentIds = await this.documentModel
        .find({ ownerId: userId })
        .distinct('_id')
        .exec();

      const primaryDocumentTags = await this.documentTagModel
        .find({
          isPrimary: true,
          documentId: { $in: userDocumentIds.map((id) => id.toString()) }
        })
        .distinct('documentId')
        .exec();

      query._id = { $in: primaryDocumentTags };
    }

    const documents = await this.documentModel.find(query).sort({ createdAt: -1 }).exec();
    return documents;
  }

  async getDocumentById(userId: string, id: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findOne({ _id: id, ownerId: userId }).exec();
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }
}

