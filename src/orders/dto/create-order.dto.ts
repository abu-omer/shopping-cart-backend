// src/orders/dto/create-order.dto.ts

import {
    IsString,
    IsNumber,
    IsArray,
    ValidateNested,
    Min,
    ArrayMinSize,
    IsMongoId,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer'; // For @Type decorator with ValidateNested
import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'src/users/entities/user.entity';



// Define expected structure for individual item in the order request
export class CreateOrderItemDto {
    @ApiProperty({
        description: 'The MongoDB ObjectId of the product',
        example: '60d5ec49f1c7d2001c9b2f6f',
    })
    @IsMongoId()
    productId: string;

    @ApiProperty({
        description: 'The quantity of the product',
        example: 2,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    quantity: number;
}

// Define possible payment methods
enum PaymentMethod {
    CREDIT_CARD = 'Credit Card',
    PAYPAL = 'PayPal',
    COD = 'Cash on Delivery',
    BANK_TRANSFER = 'Bank Transfer',
}

export class CreateOrderDto {
    // UserId is typically extracted from the authenticated user's token/session
    // and not passed directly in the DTO from the frontend for security reasons.
    // It will be added by the backend service.

    @ApiProperty({
        description: 'An array of product items to be included in the order',
        type: [CreateOrderItemDto],
        minItems: 1,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true }) // Validate each item in the array
    @Type(() => CreateOrderItemDto) // Crucial for nested DTO validation
    items: CreateOrderItemDto[];

    @ApiProperty({
        description: 'Street address for shipping',
        example: '123 Main St',
    })
    @IsString()
    shippingAddress: Address;


    @ApiProperty({
        description: 'Any special shipping instructions',
        example: 'Leave package at front door.',
        required: false,
    })
    @IsString()
    @IsOptional()
    shippingInstructions?: string;

    @ApiProperty({
        description: 'The chosen payment method for the order',
        enum: PaymentMethod,
        example: PaymentMethod.CREDIT_CARD,
    })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}