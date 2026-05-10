

// --- src/orders/schemas/order.schema.ts ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Address, User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

// --- Embedded Sub-Schema for OrderItem ---
@Schema()
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId | Product;

    @Prop({ required: true, trim: true })
    productTitle: string;

    @Prop({ required: true, type: Number, min: 0 })
    quantity: number;

    @Prop({ required: true, type: Number, min: 0 })
    price: number;

    @Prop({ type: [String] })
    images?: string[];
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

// --- Main Order Schema ---
@Schema({ timestamps: true }) // Add createdAt and updatedAt fields automatically
export class Order {
    // Explicitly define _id, createdAt, and updatedAt for TypeScript recognition
    _id?: Types.ObjectId; // Mongoose adds this automatically
    createdAt?: Date; // Mongoose adds this with timestamps: true
    updatedAt?: Date; // Mongoose adds this with timestamps: true

    // @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) // Kept index: true
    // userId: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: User;

    @Prop({
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true, // Added index: true here for consistency and to make schema.index redundant
    })
    status: string;

    @Prop({ type: [OrderItemSchema], default: [] })
    items: OrderItem[];

    @Prop({ required: true, type: Number, min: 0 })
    totalAmount: number;

    @Prop({ required: true, trim: true })
    shippingAddress: Address;

    @Prop({ type: String, trim: true })
    shippingInstructions?: string;

    @Prop({ trim: true })
    paymentMethod?: string;

    @Prop({ required: true, trim: true })
    paymentStatus: string;

    @Prop()
    transactionId?: string;

}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Removed duplicate index definitions to prevent Mongoose warnings
// OrderSchema.index({ userId: 1 }); // Removed - redundant with index: true on @Prop
// OrderSchema.index({ status: 1 }); // Removed - redundant with index: true on @Prop
OrderSchema.index({ createdAt: -1 });