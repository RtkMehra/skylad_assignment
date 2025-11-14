import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { OcrWebhookDto } from './dto/ocr-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('ocr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process OCR webhook',
    description: `Ingest OCR text content and classify it as "official" or "ad".

**Classification Rules:**
- **Official**: Contains financial/legal terms (contract, invoice, agreement, legal, etc.)
- **Ad**: Contains promotional terms (sale, discount, limited time, unsubscribe, etc.)

**For Ads:**
- Extracts unsubscribe information (email/URL)
- Creates a Task with status "pending"
- Rate limit: Maximum 3 tasks per sender (source) per day per user
- If rate limit exceeded, returns processed: false with reason

**Audit:**
- All webhook events are logged in the audit log`,
  })
  @ApiBody({
    type: OcrWebhookDto,
    examples: {
      ad: {
        summary: 'Ad with unsubscribe',
        value: {
          source: 'scanner-01',
          imageId: 'img_123',
          text: 'LIMITED TIME SALE! Get 50% off. unsubscribe: mailto:stop@brand.com',
          meta: { address: '123 Main St' },
        },
      },
      official: {
        summary: 'Official document',
        value: {
          source: 'scanner-01',
          imageId: 'img_124',
          text: 'Service Agreement. Terms and conditions apply. Legal document with invoice details.',
          meta: {},
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        imageId: 'img_123',
        classification: 'ad',
        processed: true,
        taskId: '507f1f77bcf86cd799439011',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit exceeded',
    schema: {
      example: {
        imageId: 'img_123',
        classification: 'ad',
        processed: false,
        reason: 'Rate limit exceeded: maximum 3 tasks per sender per day',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async processOcrWebhook(@CurrentUser() user: any, @Body() dto: OcrWebhookDto) {
    return this.webhooksService.processOcrWebhook(user.id, dto);
  }
}

