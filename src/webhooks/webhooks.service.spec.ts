import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhooksService, ContentClassification } from './webhooks.service';
import { Task } from '../schemas/task.schema';
import { AuditService } from '../audit/audit.service';

describe('WebhooksService', () => {
  let service: WebhooksService;

  const mockTaskModel = {
    create: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('classifyContent', () => {
    it('should classify as official for financial terms', () => {
      const text = 'This is a contract agreement with invoice details';
      const classification = (service as any).classifyContent(text);
      expect(classification).toBe(ContentClassification.OFFICIAL);
    });

    it('should classify as ad for promotional terms', () => {
      const text = 'LIMITED TIME SALE! Discount offer! unsubscribe: mailto:stop@brand.com';
      const classification = (service as any).classifyContent(text);
      expect(classification).toBe(ContentClassification.AD);
    });
  });

  describe('processOcrWebhook', () => {
    it('should create task for ad with unsubscribe and respect rate limit', async () => {
      const userId = 'user123';
      const dto = {
        source: 'scanner-01',
        imageId: 'img_123',
        text: 'LIMITED TIME SALE! unsubscribe: mailto:stop@brand.com',
        meta: {},
      };

      mockTaskModel.countDocuments.mockResolvedValue(2); // Less than 3
      mockTaskModel.create.mockResolvedValue({ _id: 'task123' });

      const result = await service.processOcrWebhook(userId, dto);

      expect(result.classification).toBe(ContentClassification.AD);
      expect(result.processed).toBe(true);
      expect(mockTaskModel.create).toHaveBeenCalled();
    });

    it('should not create task if rate limit exceeded', async () => {
      const userId = 'user123';
      const dto = {
        source: 'scanner-01',
        imageId: 'img_123',
        text: 'LIMITED TIME SALE! unsubscribe: mailto:stop@brand.com',
        meta: {},
      };

      mockTaskModel.countDocuments.mockResolvedValue(3); // At limit

      const result = await service.processOcrWebhook(userId, dto);

      expect(result.processed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');
      expect(mockTaskModel.create).not.toHaveBeenCalled();
    });
  });
});

