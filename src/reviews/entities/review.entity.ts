import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) // index: true for userId
  userId: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true }) // index: true for productId
  productId: Types.ObjectId | Product;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop({ type: String, trim: true, required: true })
  comment: string;

  @Prop({ type: String, trim: true })
  reviewerName?: string;

  @Prop({ type: String, trim: true })
  reviewerEmail?: string;

  @Prop({ type: Date, default: Date.now })
  date?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);