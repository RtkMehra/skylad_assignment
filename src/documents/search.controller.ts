import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPPORT, UserRole.MODERATOR)
@ApiBearerAuth('JWT-auth')
export class SearchController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Search documents',
    description: `Full-text search across documents with optional scope filtering.

**Scope Rules:**
- Use \`scope=folder\` to search within all folders (documents with primary tags)
- Use \`scope=files\` with \`ids[]\` to search within specific document IDs
- **Cannot use both folder scope and file IDs together**

**Examples:**
- Search all: \`/v1/search?q=invoice\`
- Search in folders: \`/v1/search?q=invoice&scope=folder\`
- Search specific files: \`/v1/search?q=invoice&scope=files&ids[]=doc1&ids[]=doc2\``,
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string', example: 'invoice' })
  @ApiQuery({ name: 'scope', required: false, enum: ['folder', 'files'], description: 'Search scope' })
  @ApiQuery({ name: 'ids', required: false, type: [String], description: 'Document IDs (required when scope=files)' })
  @ApiResponse({
    status: 200,
    description: 'List of matching documents',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          filename: { type: 'string' },
          textContent: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid scope combination' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchDocuments(@CurrentUser() user: any, @Query() dto: SearchDocumentsDto) {
    return this.documentsService.searchDocuments(user.id, dto);
  }
}

