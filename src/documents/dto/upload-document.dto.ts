import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'invoice-2025-01.pdf',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  mime: string;

  @ApiProperty({
    description: 'Text content extracted from the document',
    example: 'Invoice for January 2025. Total: $1,500.00. Payment due: 30 days.',
  })
  @IsString()
  @IsNotEmpty()
  textContent: string;

  @ApiProperty({
    description: 'Primary tag name (creates folder if not exists). Each document must have exactly one primary tag.',
    example: 'invoices-2025',
  })
  @IsString()
  @IsNotEmpty()
  primaryTag: string;

  @ApiPropertyOptional({
    description: 'Optional array of secondary tag names',
    example: ['january', 'billing'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secondaryTags?: string[];
}

