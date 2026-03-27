
import { IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddItemToCartDto {
  @ApiProperty({
    description: 'The MongoDB ObjectId of the product to add to cart',
    example: '60d5ec49f1c7d2001c9b2f6f',
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product to add/update in the cart',
    example: 1,
    minimum: 1,

  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}