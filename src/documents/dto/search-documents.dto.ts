import { IsString, IsOptional, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchScope {
  FOLDER = 'folder',
  FILES = 'files',
}

export class SearchDocumentsDto {
  @ApiProperty({
    description: 'Search query string for full-text search',
    example: 'invoice',
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({
    description: 'Search scope: "folder" to search within all folders, "files" to search within specific file IDs',
    enum: SearchScope,
    example: SearchScope.FILES,
  })
  @IsEnum(SearchScope)
  @IsOptional()
  scope?: SearchScope;

  @ApiPropertyOptional({
    description: 'Array of document IDs to search within (required when scope=files). Cannot be used with scope=folder.',
    example: ['doc1', 'doc2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];
}

