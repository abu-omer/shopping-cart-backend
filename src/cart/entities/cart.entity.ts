import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Product } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";

@Schema()
export class CartProduct {

  @Prop({ type: Types.ObjectId, ref: 'Product', required: false })
  productId?: Types.ObjectId | Product;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 0 })
  total: number;

  @Prop({ type: Number, min: 0 })
  discountPercentage: number;

  @Prop({ type: Number, min: 0 })
  discountedTotal: number;

  @Prop({ type: String })
  thumbnail: string;
}

export const CartProductSchema = SchemaFactory.createForClass(CartProduct);
export type CartDocument = Document & Cart;

@Schema({ timestamps: true })
export class Cart {

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, unique: true, index: true })
  userObjectId?: Types.ObjectId | User;

  @Prop({ type: Number })
  userId: number;

  @Prop({ type: [CartProductSchema], default: [] })
  products: CartProduct[];

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  total: number;

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  discountedTotal: number;

  @Prop({ type: Number, default: 0 })
  totalProducts: number;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;

  @Prop({ type: Date, default: null })
  lastAccessedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.pre('save', function (next) {
  const cart = this as any;
  cart.total = cart.products.reduce((acc: number, product: CartProduct) => acc + (product.total || 0), 0);
  cart.discountedTotal = cart.products.reduce((acc: number, product: CartProduct) => acc + (product.discountedTotal || 0), 0);
  cart.totalProducts = cart.products.length;
  cart.totalQuantity = cart.products.reduce((acc: number, product: CartProduct) => acc + (product.quantity || 0), 0);
  next();
});
