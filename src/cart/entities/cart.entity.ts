import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Product } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId | Product;
  @Prop({ required: true, trim: true })
  productName: string;
  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: [String] })
  imageFiles?: string[];
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
export type CartDocument = Document & Cart;
@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId | User;
  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
  @Prop({ required: true, type: Number, min: 0, default: 0 })
  totalPrice: number;
  @Prop({ type: Date, default: null })
  lastAccessedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  next();
});
