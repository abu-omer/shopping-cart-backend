// // src/products/interfaces/product.interface.ts

// import { Document, Types } from 'mongoose';
// import { Category } from '../../categories/schemas/category.schema';
// import { Review } from '../../reviews/schemas/review.schema';

// export interface Product extends Document {
//     readonly name: string;
//     readonly description: string;
//     readonly price: number;
//     readonly stock: number;
//     readonly imageUrls: string[];
//     readonly tags: string[];
//     readonly categories: Types.ObjectId[] | Category[]; // Can be IDs or populated Category objects
//     readonly reviews?: Review[]; // Optional, as it's a virtual populate
//     readonly averageRating?: number;
//     readonly numberOfReviews?: number;
//     readonly status?: string;
//     readonly createdAt?: Date;
//     readonly updatedAt?: Date;
// }