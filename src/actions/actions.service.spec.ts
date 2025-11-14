import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionsService } from './actions.service';
import { Usage } from '../schemas/usage.schema';
import { Document } from '../schemas/document.schema';
import { Tag } from '../schemas/tag.schema';
import { DocumentTag } from '../schemas/document-tag.schema';
import { AuditService } from '../audit/audit.service';
import { DocumentsService } from '../documents/documents.service';
import { ScopeType } from './dto/run-action.dto';

describe('ActionsService', () => {
  let service: ActionsService;

  const mockUsageModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockDocumentModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockTagModel = {};
  const mockDocumentTagModel = {};

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockDocumentsService = {
    getFolderDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: getModelToken(Usage.name),
          useValue: mockUsageModel,
        },
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
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    service = module.get<ActionsService>(ActionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runAction', () => {
    it('should reject folder scope with file IDs', async () => {
      const userId = 'user123';
      const dto = {
        scope: { type: ScopeType.FOLDER, name: 'invoices', ids: ['doc1'] },
        messages: [{ role: 'user', content: 'test' }],
        actions: ['make_document'],
      };

      await expect(service.runAction(userId, dto)).rejects.toThrow('Cannot use both folder scope and file IDs');
    });

    it('should track 5 credits per request', async () => {
      const userId = 'user123';
      const dto = {
        scope: { type: ScopeType.FOLDER, name: 'invoices' },
        messages: [{ role: 'user', content: 'test' }],
        actions: ['make_document'],
      };

      mockDocumentsService.getFolderDocuments.mockResolvedValue([
        { _id: 'doc1', filename: 'test.pdf', textContent: 'content' },
      ]);
      mockDocumentModel.create.mockResolvedValue({ _id: 'newdoc', filename: 'generated.txt' });
      mockUsageModel.create.mockResolvedValue({});

      await service.runAction(userId, dto);

      expect(mockUsageModel.create).toHaveBeenCalledWith({
        userId,
        credits: 5,
        action: 'run_action',
      });
    });
  });
});

