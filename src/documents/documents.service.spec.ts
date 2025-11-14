import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentsService } from './documents.service';
import { Document } from '../schemas/document.schema';
import { Tag } from '../schemas/tag.schema';
import { DocumentTag } from '../schemas/document-tag.schema';
import { AuditService } from '../audit/audit.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentModel: Model<Document>;
  let tagModel: Model<Tag>;
  let documentTagModel: Model<DocumentTag>;

  const mockDocumentModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockTagModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDocumentTagModel = {
    create: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(Document.name),
          useValue: mockDocumentModel,
        },
        {
          provide: getModelToken(Tag.name),
          useValue: mockTagModel,
        },
        {
          provide: getModelToken(DocumentTag.name),
          useValue: mockDocumentTagModel,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentModel = module.get<Model<Document>>(getModelToken(Document.name));
    tagModel = module.get<Model<Tag>>(getModelToken(Tag.name));
    documentTagModel = module.get<Model<DocumentTag>>(getModelToken(DocumentTag.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should create document with exactly one primary tag', async () => {
      const userId = 'user123';
      const dto = {
        filename: 'test.pdf',
        mime: 'application/pdf',
        textContent: 'Test content',
        primaryTag: 'invoices',
        secondaryTags: ['2025'],
      };

      const mockTag = { _id: 'tag123', name: 'invoices', ownerId: userId };
      const mockDocument = { _id: 'doc123', ...dto, ownerId: userId };

      mockTagModel.findOne.mockResolvedValue(mockTag);
      mockDocumentModel.create.mockResolvedValue(mockDocument);
      mockDocumentTagModel.create.mockResolvedValue({});

      const result = await service.uploadDocument(userId, dto);

      expect(mockDocumentModel.create).toHaveBeenCalled();
      // Verify primary tag is created with isPrimary: true
      expect(mockDocumentTagModel.create).toHaveBeenCalledWith({
        documentId: 'doc123',
        tagId: 'tag123',
        isPrimary: true,
      });
      // Verify secondary tags are created with isPrimary: false
      expect(mockDocumentTagModel.create).toHaveBeenCalledWith({
        documentId: 'doc123',
        tagId: expect.any(String),
        isPrimary: false,
      });
      expect(result).toBeDefined();
    });
  });

  describe('searchDocuments', () => {
    it('should reject folder scope with file IDs', async () => {
      const userId = 'user123';
      const dto = {
        q: 'invoice',
        scope: 'folder' as any,
        ids: ['doc1', 'doc2'],
      };

      await expect(service.searchDocuments(userId, dto)).rejects.toThrow(
        'Cannot use both folder scope and file IDs',
      );
    });
  });
});

