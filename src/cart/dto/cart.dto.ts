import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CartProductDto {

  @ApiProperty({ example: '60d5ec49f1c7d2001c9b2f6f', required: false })
  productId?: string;

  @ApiProperty({ example: 'Blue Frock', required: false })
  title?: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 4 })
  quantity: number;

  @ApiProperty({ example: 119.96 })
  total: number;

  @ApiProperty({ example: 12.13 })
  discountPercentage: number;

  @ApiProperty({ example: 105.41 })
  discountedTotal: number;

  @ApiProperty({ example: 'https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp' })
  thumbnail: string;
}

export class CartDto {

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: [CartProductDto] })
  @Type(() => CartProductDto)
  products: CartProductDto[];

  @ApiProperty({ example: 13037.88 })
  total: number;

  @ApiProperty({ example: 11510.81 })
  discountedTotal: number;

  @ApiProperty({ example: 4 })
  totalProducts: number;

  @ApiProperty({ example: 12 })
  totalQuantity: number;
}
