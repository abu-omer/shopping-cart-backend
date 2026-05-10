

import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsMongoId,
  IsUrl,
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

class DimensionsDto {
  @IsNumber()
  @IsOptional()
  width: number;

  @IsNumber()
  @IsOptional()
  height: number;

  @IsNumber()
  @IsOptional()
  depth: number;
}

class MetaDto {
  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;

  @IsString()
  @IsOptional()
  barcode: string;

  @IsString()
  @IsOptional()
  qrCode: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'The title of the product',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example:
      'High-fidelity wireless headphones with noise cancellation and long battery life.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The discount percentage of the product',
    example: 10.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({
    description: 'The rating of the product',
    example: 4.5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'The current stock quantity of the product',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'An array of tags associated with the product',
    type: [String],
    example: ['electronics', 'audio', 'headphones'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'The brand of the product',
    example: 'Sony',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    description: 'The SKU of the product',
    example: 'SONY-WH1000XM4',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'The weight of the product',
    example: 250,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'The dimensions of the product',
    type: DimensionsDto,
  })
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @ApiProperty({
    description: 'The warranty information of the product',
    example: '1 year warranty',
  })
  @IsString()
  @IsOptional()
  warrantyInformation?: string;

  @ApiProperty({
    description: 'The shipping information of the product',
    example: 'Ships in 3-5 days',
  })
  @IsString()
  @IsOptional()
  shippingInformation?: string;

  @ApiProperty({
    description: 'The availability status of the product',
    example: 'In Stock',
  })
  @IsString()
  @IsOptional()
  availabilityStatus?: string;

  @ApiProperty({
    description: 'The return policy of the product',
    example: '30 days return policy',
  })
  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @ApiProperty({
    description: 'The minimum order quantity of the product',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  minimumOrderQuantity?: number;

  @ApiProperty({
    description: 'The metadata of the product',
    type: MetaDto,
  })
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta?: MetaDto;

  @ApiProperty({
    description: 'An array of URLs for product images',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: 'The thumbnail URL of the product',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'An array of MongoDB ObjectId strings for associated categories',
    type: [String],
    example: ['60d5ec49f1c7d2001c9b2f6b', '60d5ec49f1c7d2001c9b2f6c'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  categories?: (string | Types.ObjectId)[];

  @ApiProperty({
    description: 'The status of the product (e.g., available, out_of_stock)',
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
