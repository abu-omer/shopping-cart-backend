// import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
// import { ObjectId } from 'mongoose';
// import { ProductType } from '../entities/product.entity';

// export class CreateProductDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   description: string;

//   @IsNotEmpty()
//   @IsNumber()
//   price: number;
//   @IsOptional()
//   @IsNumber()
//   stock?: number;
//   @IsOptional()


//   @IsOptional()
//   @IsString()
//   color?: string;

//   @IsOptional()
//   @IsString()
//   size?: string;

//   @IsEnum(ProductType)
//   @IsOptional()
//   productType?: ProductType;

//   @IsOptional()
//   @IsNumber()
//   ratings?: number;

//   @IsArray()
//   @IsString({ each: true })
//   @IsOptional()
//   imageFiles?: string[];

//   @IsOptional()
//   review: string;

//   @IsNotEmpty()
//   @IsMongoId()
//   categoriesId: ObjectId;

//   @IsNotEmpty()
//   @IsMongoId()
//   subCategoriesId: ObjectId;
// }


import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  IsMongoId,
  IsUrl,
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // For API documentation (optional but recommended)
import { Types } from 'mongoose';

enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example:
      'High-fidelity wireless headphones with noise cancellation and long battery life.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The current stock quantity of the product',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'An array of URLs for product images',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true }) // Validate each item in the array as a URL
  @IsOptional() // Images might be uploaded after product creation
  imageFiles?: string[];

  @ApiProperty({
    description: 'An array of tags associated with the product',
    type: [String],
    example: ['electronics', 'audio', 'headphones'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique() // Ensure no duplicate tags
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'An array of MongoDB ObjectId strings for associated categories',
    type: [String],
    example: ['60d5ec49f1c7d2001c9b2f6b', '60d5ec49f1c7d2001c9b2f6c'],
  })
  @IsArray()
  @IsMongoId({ each: true }) // Validate each item as a valid MongoDB ObjectId
  @ArrayMinSize(1) // A product should belong to at least one category
  categories?: (string | Types.ObjectId)[];
  ; // These will be category IDs passed from the frontend

  @ApiProperty({
    description: 'The status of the product (e.g., available, out_of_stock)',
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
