// src/reviews/dto/update-review.dto.ts

import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto'; // Import the CreateReviewDto

// Extend CreateReviewDto and make only the rating and comment optional for updates
export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({
    description: 'The updated rating for the product (1 to 5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'The updated review comment for the product',
    example: 'Still loving them, the battery life is impressive.',
    required: false,
  })
  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  comment?: string;

  // productId and userId are not included here as they should not be changeable
  // for an existing review.
}