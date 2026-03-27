// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { Document, Types } from 'mongoose';
// import { Category } from "src/categories/entities/category.entity";
// import { SubCategory } from "src/sub-categories/entities/sub-category.entity";
// export enum ProductType {
//   AVAILABLE = "available",
//   BEST_SELLING = "best_selling",
//   UPCOMING = "upcoming",
// } export type ProductDocument = Product & Document
// @Schema()
// export class Product {
//   _id: Types.ObjectId;

//   @Prop({ required: true })
//   name: string
//   @Prop({ required: true })
//   description: string
//   @Prop({ required: true })
//   price: number

//   @Prop()
//   review: string
//   @Prop()
//   color: string;

//   @Prop()
//   size: string;
//   @Prop({
//     type: String,
//     enum: ProductType,
//     default: ProductType.AVAILABLE,
//   })
//   productType: ProductType;

//   @Prop({ default: 0 })
//   stock: number;
//   @Prop([String])
//   imageFiles?: string[];

//   @Prop({ default: 0 })
//   ratings: number;

//   @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
//   categoriesId: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, ref: SubCategory.name, required: true })
//   subCategoriesId: Types.ObjectId;
// }

// export const ProductSchema = SchemaFactory.createForClass(Product)


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/entities/category.entity';
import { Review } from 'src/reviews/entities/review.entity';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ required: true, unique: true, trim: true, index: true }) // index: true for name
  name: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  stock: number;

  @Prop([String])
  imageFiles: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[] | Category[];

  @Prop({ type: String, enum: ['available', 'out_of_stock', 'discontinued'], default: 'available', index: true }) // index: true for status
  status: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Review' }] })
  reviews: Types.ObjectId[] | Review[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);