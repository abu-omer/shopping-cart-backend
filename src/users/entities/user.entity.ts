import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Address {

  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop({ required: true, default: 'Sudan' })
  country: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users'
})
export class User {
  _id?: Types.ObjectId;

  // @Prop({ required: true, unique: true, })
  // username: string;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: null })
  phoneNumber?: string;
  @Prop({ type: String, enum: ['customer', 'admin'], default: 'customer', index: true })
  role: string;

  @Prop({ type: [Address], default: [] })
  shippingAddresses?: Address[];

  @Prop({ type: [Types.ObjectId], default: [], ref: 'Product' })
  favoriteProducts: Types.ObjectId[];


}

export const UserSchema = SchemaFactory.createForClass(User);