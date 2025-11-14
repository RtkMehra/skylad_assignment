import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Documents')
@Controller('docs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload a document',
    description: 'Upload a document with a primary tag (required) and optional secondary tags. The primary tag creates a folder if it does not exist. Each document must have exactly one primary tag.',
  })
  @ApiBody({ type: UploadDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        ownerId: '507f1f77bcf86cd799439012',
        filename: 'invoice-2025-01.pdf',
        mime: 'application/pdf',
        textContent: 'Invoice content...',
        createdAt: '2025-01-13T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async uploadDocument(@CurrentUser() user: any, @Body() dto: UploadDocumentDto) {
    return this.documentsService.uploadDocument(user.id, dto);
  }

}

@ApiTags('Folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FoldersController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPPORT, UserRole.MODERATOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'List all folders',
    description: 'Returns all primary-tag folders with document counts. Folders are automatically created when documents are uploaded with primary tags.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of folders with document counts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'invoices-2025' },
          count: { type: 'number', example: 5 },
        },
      },
      example: [
        { id: '507f1f77bcf86cd799439011', name: 'invoices-2025', count: 5 },
        { id: '507f1f77bcf86cd799439012', name: 'legal', count: 2 },
        { id: '507f1f77bcf86cd799439013', name: 'receipts', count: 3 },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFolders(@CurrentUser() user: any) {
    return this.documentsService.getFolders(user.id);
  }

  @Get(':tag/docs')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPPORT, UserRole.MODERATOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get documents in a folder',
    description: 'Returns all documents where the specified tag is the primary tag. The tag parameter can be either the tag ID or tag name. Only returns documents owned by the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of documents in the folder',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          ownerId: { type: 'string' },
          filename: { type: 'string' },
          mime: { type: 'string' },
          textContent: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Folder (tag) not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFolderDocuments(@CurrentUser() user: any, @Param('tag') tag: string) {
    return this.documentsService.getFolderDocuments(user.id, tag);
  }
}

