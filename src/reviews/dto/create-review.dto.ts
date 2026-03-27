// src/reviews/dto/create-review.dto.ts

import { IsString, IsNumber, Min, Max, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The rating for the product (1 to 5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'The review comment for the product',
    example: 'Great product! Highly recommend for its quality and features.',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'The MongoDB ObjectId of the product being reviewed',
    example: '60d5ec49f1c7d2001c9b2f6f', // Example Product ID
  })
  @IsMongoId()
  productId: string; // This will be the ID of the product from the frontend

  @IsOptional()
  @IsMongoId()
  userId?: string
}