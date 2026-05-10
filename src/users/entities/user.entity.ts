import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
class Coordinates {
  @Prop()
  lat: number;

  @Prop()
  lng: number;
}

@Schema({ _id: true })
export class Address {
  @Prop()
  address: string; // "street" in previous version

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  stateCode: string;

  @Prop()
  postalCode: string; // "zipCode" in previous version

  @Prop({ type: Coordinates })
  coordinates: Coordinates;

  @Prop({ required: true, default: 'United States' })
  country: string;
}

@Schema({ _id: true })
class Hair {
  @Prop()
  color: string;

  @Prop()
  type: string;
}

@Schema({ _id: true })
class Bank {
  @Prop()
  cardExpire: string;

  @Prop()
  cardNumber: string;

  @Prop()
  cardType: string;

  @Prop()
  currency: string;

  @Prop()
  iban: string;
}

@Schema({ _id: true })
class Company {
  @Prop()
  department: string;

  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop({ type: Address })
  address: Address;
}

@Schema({ _id: true })
class Crypto {
  @Prop()
  coin: string;

  @Prop()
  wallet: string;

  @Prop()
  network: string;
}

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users'
})
export class User {
  _id?: Types.ObjectId;




  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  maidenName?: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  phone: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  birthDate: string;

  @Prop()
  image: string;

  @Prop()
  bloodGroup: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop()
  eyeColor: string;

  @Prop({ type: Hair })
  hair: Hair;

  @Prop()
  ip: string;

  @Prop({ type: Address })
  address: Address;

  @Prop()
  macAddress: string;

  @Prop()
  university: string;

  @Prop({ type: Bank })
  bank: Bank;

  @Prop({ type: Company })
  company: Company;

  @Prop()
  ein: string;

  @Prop()
  ssn: string;

  @Prop()
  userAgent: string;

  @Prop({ type: Crypto })
  crypto: Crypto;

  @Prop({ type: String, enum: ['admin', 'moderator', 'user', 'customer'], default: 'user', index: true })
  role: string;

  @Prop({ type: [Address], default: [] })
  shippingAddresses?: Address[];

  @Prop({ type: [Types.ObjectId], default: [], ref: 'Product' })
  favoriteProducts: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const AddressSchema = SchemaFactory.createForClass(Address);