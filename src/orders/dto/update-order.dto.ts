// src/orders/dto/update-order.dto.ts

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

// Define possible order statuses (matching your schema enum)
enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export class UpdateOrderDto {
    @ApiProperty({
        description: 'The updated status of the order',
        enum: OrderStatus,
        example: OrderStatus.SHIPPED,
        required: false,
    })
    @IsEnum(OrderStatus, { message: 'Invalid order status' })
    @IsOptional()
    status?: OrderStatus;

    @ApiProperty({
        description: 'Updated shipping instructions for the order',
        example: 'Please leave package at the back door.',
        required: false,
    })
    @IsString()
    @IsOptional()
    shippingInstructions?: string;

    @ApiProperty({
        description: 'The transaction ID from the payment gateway',
        example: 'txn_123xyzABC',
        required: false,
    })
    @IsString()
    @IsOptional()
    transactionId?: string;
}