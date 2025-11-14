import { IsObject, IsArray, IsString, IsEnum, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScopeType {
  FOLDER = 'folder',
  FILES = 'files',
}

export class ScopeDto {
  @ApiProperty({
    description: 'Scope type: "folder" to process all documents in a folder, "files" to process specific documents',
    enum: ScopeType,
    example: ScopeType.FOLDER,
  })
  @IsEnum(ScopeType)
  @IsNotEmpty()
  type: ScopeType;

  @ApiPropertyOptional({
    description: 'Folder name (required when type=folder). Must be a primary tag name.',
    example: 'invoices-2025',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Array of document IDs (required when type=files). Cannot be used with type=folder.',
    example: ['doc1', 'doc2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];
}

export class MessageDto {
  @ApiProperty({
    description: 'Message role',
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Message content/instruction',
    example: 'make a CSV of vendor totals',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class RunActionDto {
  @ApiProperty({
    description: 'Scope definition - either folder or files, not both',
    type: ScopeDto,
  })
  @ValidateNested()
  @Type(() => ScopeDto)
  @IsObject()
  @IsNotEmpty()
  scope: ScopeDto;

  @ApiProperty({
    description: 'Array of messages/instructions for the action',
    type: [MessageDto],
    example: [{ role: 'user', content: 'make a CSV of vendor totals' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @ApiProperty({
    description: 'Array of actions to execute. Supported: "make_document", "make_csv"',
    example: ['make_document', 'make_csv'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

