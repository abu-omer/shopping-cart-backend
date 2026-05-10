
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/entities/category.entity';
import { Review } from 'src/reviews/entities/review.entity';

export type ProductDocument = Product & Document;

@Schema({ _id: false })
class Dimensions {
  @Prop({ type: Number })
  width: number;

  @Prop({ type: Number })
  height: number;

  @Prop({ type: Number })
  depth: number;
}

@Schema({ _id: false })
class Meta {
  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: String })
  barcode: string;

  @Prop({ type: String })
  qrCode: string;
}

@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;



  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ required: true, unique: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 0, default: 0 })
  discountPercentage?: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  rating?: number;

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  stock: number;

  @Prop([String])
  tags: string[];

  @Prop({ type: String, trim: true })
  brand?: string;

  @Prop({ type: String, trim: true })
  sku?: string;

  @Prop({ type: Number })
  weight?: number;

  @Prop({ type: Dimensions })
  dimensions?: Dimensions;

  @Prop({ type: String })
  warrantyInformation?: string;

  @Prop({ type: String })
  shippingInformation?: string;

  @Prop({ type: String })
  availabilityStatus?: string;

  @Prop({ type: String })
  returnPolicy?: string;

  @Prop({ type: Number })
  minimumOrderQuantity?: number;

  @Prop({ type: Meta })
  meta?: Meta;

  @Prop([String])
  images: string[];

  @Prop({ type: String })
  thumbnail?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[] | Category[];

  @Prop({ type: String, enum: ['available', 'out_of_stock', 'discontinued'], default: 'available', index: true })
  status: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Review' }] })
  reviews: Types.ObjectId[] | Review[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);