// // src/users/interfaces/user.interface.ts

// import { Document, Types } from 'mongoose';
// import { Review } from '../../reviews/schemas/review.schema';
// import { Order } from '../../orders/schemas/order.schema'; // Assuming an Order schema
// import { Cart } from '../../cart/schemas/cart.schema'; // Assuming a Cart schema

// export interface User extends Document {
//   readonly email: string;
//   readonly password?: string; // Password can be optional in interface as it's hashed and not always returned
//   readonly firstName: string;
//   readonly lastName: string;
//   readonly role?: string; // 'admin' | 'customer'
//   readonly phoneNumber?: string;
//   readonly address?: string;
//   readonly reviews?: Review[]; // Optional, as it's a virtual populate
//   readonly orders?: Order[]; // Optional, as it's a virtual populate
//   readonly cart?: Cart; // Optional, as it's a virtual populate
//   readonly createdAt?: Date;
//   readonly updatedAt?: Date;
// }

// export interface Address {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
// }