import { Controller, Post, Get, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ActionsService } from './actions.service';
import { RunActionDto } from './dto/run-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Actions')
@Controller('actions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Run scoped action on documents',
    description: `Execute actions on a set of documents defined by scope (folder or files).

**Scope Types:**
- \`folder\`: Process all documents in a folder (primary tag)
- \`files\`: Process specific documents by IDs

**Actions:**
- \`make_document\`: Creates a new document with generated text
- \`make_csv\`: Generates a CSV file and stores as a document

**Usage:**
- Each request consumes **5 credits**
- Credits are tracked in the Usage collection

**Validation:**
- Cannot use both folder scope and file IDs together
- Folder scope requires \`name\` parameter
- Files scope requires \`ids\` array`,
  })
  @ApiBody({
    type: RunActionDto,
    examples: {
      folderScope: {
        summary: 'Folder scope example',
        value: {
          scope: { type: 'folder', name: 'invoices-2025' },
          messages: [{ role: 'user', content: 'make a CSV of vendor totals' }],
          actions: ['make_document', 'make_csv'],
        },
      },
      filesScope: {
        summary: 'Files scope example',
        value: {
          scope: { type: 'files', ids: ['doc1', 'doc2'] },
          messages: [{ role: 'user', content: 'summarize these documents' }],
          actions: ['make_document'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Action executed successfully',
    schema: {
      example: {
        success: true,
        createdDocuments: [
          { _id: 'doc1', filename: 'generated-123.txt', mime: 'text/plain' },
          { _id: 'doc2', filename: 'generated-123.csv', mime: 'text/csv' },
        ],
        creditsUsed: 5,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid scope or validation failed' })
  @ApiResponse({ status: 404, description: 'No documents found in scope' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async runAction(@CurrentUser() user: any, @Body() dto: RunActionDto) {
    return this.actionsService.runAction(user.id, dto);
  }

  @Get('usage/month')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get usage statistics for a month',
    description: 'Returns the total credits consumed by the authenticated user for the specified month. Each action request consumes 5 credits.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Year (defaults to current year)', example: 2025 })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Month 1-12 (defaults to current month)', example: 11 })
  @ApiResponse({
    status: 200,
    description: 'Usage statistics',
    schema: {
      example: {
        userId: '507f1f77bcf86cd799439012',
        credits: 15,
        year: 2025,
        month: 11,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUsageForMonth(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const credits = await this.actionsService.getUsageForMonth(user.id, yearNum, monthNum);
    return { userId: user.id, credits, year: yearNum, month: monthNum };
  }
}

