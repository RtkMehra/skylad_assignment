import { IsString, IsObject, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcrWebhookDto {
  @ApiProperty({
    description: 'Source identifier (e.g., scanner ID). Used for rate limiting (max 3 tasks per source per day per user)',
    example: 'scanner-01',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Unique identifier for the OCR image',
    example: 'img_123',
  })
  @IsString()
  @IsNotEmpty()
  imageId: string;

  @ApiProperty({
    description: 'Text content extracted from OCR. Used for classification (official/ad)',
    example: 'LIMITED TIME SALE! Get 50% off. unsubscribe: mailto:stop@brand.com',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { address: '123 Main St' },
  })
  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;
}

