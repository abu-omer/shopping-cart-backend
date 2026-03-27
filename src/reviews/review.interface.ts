// // src/reviews/interfaces/review.interface.ts

// import { Document, Types } from 'mongoose';
// import { Product } from '../../products/schemas/product.schema';
// import { User } from '../../users/schemas/user.schema';

// export interface Review extends Document {
//   readonly rating: number;
//   readonly comment: string;
//   readonly productId: Types.ObjectId | Product; // Can be ID or populated Product
//   readonly userId: Types.ObjectId | User; // Can be ID or populated User
//   readonly createdAt?: Date;
//   readonly updatedAt?: Date;
// }