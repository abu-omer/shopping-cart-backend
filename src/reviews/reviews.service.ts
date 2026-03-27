// // src/reviews/reviews.service.ts

// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   InternalServerErrorException,
//   BadRequestException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose'; // Import Types for ObjectId

// import { Review, ReviewDocument } from './entities/review.entity';
// import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
// import { ProductsService } from '../products/products.service'; // Import ProductsService
// import { UsersService } from '../users/users.service'; // Import UsersService (for validating userId)
// import { Product } from 'src/products/entities/product.entity';// To use Product type in populate

// @Injectable()
// export class ReviewsService {
//   constructor(
//     @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
//     private productsService: ProductsService, // Inject ProductsService
//     private usersService: UsersService, // Inject UsersService
//   ) {}

//   /**
//    * Recalculates and updates a product's average rating and total number of reviews.
//    * This is a private helper method used after review changes.
//    * @param productId The ID of the product.
//    */
//   private async recalculateProductRatingAndCount(productId: string): Promise<void> {
//     // Aggregate reviews for the given product
//     const aggregationResult = await this.reviewModel.aggregate([
//       { $match: { productId: new Types.ObjectId(productId) } },
//       {
//         $group: {
//           _id: '$productId',
//           averageRating: { $avg: '$rating' },
//           numberOfReviews: { $sum: 1 },
//         },
//       },
//     ]);

//     let averageRating = 0;
//     let numberOfReviews = 0;

//     if (aggregationResult.length > 0) {
//       averageRating = aggregationResult[0].averageRating;
//       numberOfReviews = aggregationResult[0].numberOfReviews;
//     }

//     // Update the product document
//     await this.productsService.setProductRatingAndCount(
//       productId,
//       averageRating,
//       numberOfReviews,
//     );
//   }

//   /**
//    * Creates a new product review.
//    * Ensures the product and user exist and handles potential duplicate reviews (e.g., one review per user per product).
//    * @param createReviewDto The data for creating the new review.
//    * @param userId The ID of the user creating the review (from authenticated context).
//    * @returns The created review document.
//    * @throws NotFoundException if product or user not found.
//    * @throws ConflictException if user has already reviewed this product.
//    */
//   async create(createReviewDto: CreateReviewDto, userId: string): Promise<ReviewDocument> {
//     const { productId, rating, comment } = createReviewDto;

//     // 1. Validate if Product exists
//     const productExists = await this.productsService.findById(productId);
//     if (!productExists) {
//       throw new NotFoundException(`Product with ID "${productId}" not found.`);
//     }

//     // 2. Validate if User exists (optional, often handled by AuthGuard, but good for data integrity)
//     const userExists = await this.usersService.findById(userId);
//     if (!userExists) {
//       throw new NotFoundException(`User with ID "${userId}" not found.`);
//     }

//     // 3. Check for existing review by this user for this product
//     const existingReview = await this.reviewModel.findOne({
//       productId: new Types.ObjectId(productId),
//       userId: new Types.ObjectId(userId),
//     }).exec();

//     if (existingReview) {
//       throw new ConflictException('You have already submitted a review for this product.');
//     }

//     try {
//       const createdReview = new this.reviewModel({
//         productId: new Types.ObjectId(productId),
//         userId: new Types.ObjectId(userId),
//         rating,
//         comment,
//       });

//       const savedReview = await createdReview.save();

//       // 4. Update Product's average rating and number of reviews
//       await this.recalculateProductRatingAndCount(productId);

//       return savedReview;
//     } catch (error) {
//       if (error instanceof ConflictException || error instanceof NotFoundException) {
//         throw error; // Re-throw specific errors
//       }
//       throw new InternalServerErrorException('Failed to create review.');
//     }
//   }

//   /**
//    * Finds all reviews, with optional filters and population.
//    * @param productId Optional: filter reviews by product ID.
//    * @param userId Optional: filter reviews by user ID.
//    * @param page The current page number (for pagination).
//    * @param limit The number of items per page (for pagination).
//    * @param populateProduct Whether to populate the 'productId' field (default: false).
//    * @param populateUser Whether to populate the 'userId' field (default: false).
//    * @returns An array of review documents.
//    */
//   async findAll(
//     productId?: string,
//     userId?: string,
//     page: number = 1,
//     limit: number = 10,
//     populateProduct: boolean = false,
//     populateUser: boolean = false,
//   ): Promise<ReviewDocument[]> {
//     const filter: any = {};
//     if (productId) {
//       filter.productId = new Types.ObjectId(productId);
//     }
//     if (userId) {
//       filter.userId = new Types.ObjectId(userId);
//     }

//     const query = this.reviewModel.find(filter)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ createdAt: -1 }); // Sort by most recent reviews first

//     if (populateProduct) {
//       query.populate('productId');
//     }
//     if (populateUser) {
//       query.populate('userId');
//     }

//     return query.exec();
//   }

//   /**
//    * Finds a review by its unique ID.
//    * @param id The MongoDB ObjectId of the review.
//    * @param populateProduct Whether to populate the 'productId' field (default: false).
//    * @param populateUser Whether to populate the 'userId' field (default: false).
//    * @returns The found review document.
//    * @throws NotFoundException if the review is not found.
//    */
//   async findById(
//     id: string,
//     populateProduct: boolean = false,
//     populateUser: boolean = false,
//   ): Promise<ReviewDocument> {
//     let query = this.reviewModel.findById(id);

//     if (populateProduct) {
//       query = query.populate('productId');
//     }
//     if (populateUser) {
//       query = query.populate('userId');
//     }

//     const review = await query.exec();
//     if (!review) {
//       throw new NotFoundException(`Review with ID "${id}" not found.`);
//     }
//     return review;
//   }

//   /**
//    * Updates an existing review by ID.
//    * Only the rating and comment can be updated. Revalidates ownership.
//    * @param id The MongoDB ObjectId of the review to update.
//    * @param updateReviewDto The data to update the review with.
//    * @param userId The ID of the user attempting to update (for authorization).
//    * @returns The updated review document.
//    * @throws NotFoundException if the review is not found.
//    * @throws UnauthorizedException if the user is not the owner of the review.
//    */
//   async update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<ReviewDocument> {
//     const review = await this.reviewModel.findById(id).exec();
//     if (!review) {
//       throw new NotFoundException(`Review with ID "${id}" not found.`);
//     }

//     // Authorization check: Ensure only the review's owner can update it
//     if (review.userId.toString() !== userId.toString()) {
//       throw new UnauthorizedException('You are not authorized to update this review.');
//     }

//     // Store old rating for potential recalculation if needed
//     const oldRating = review.rating;
//     const productId = review.productId.toString(); // Get product ID before update

//     // Apply updates
//     if (updateReviewDto.rating !== undefined) {
//       review.rating = updateReviewDto.rating;
//     }
//     if (updateReviewDto.comment !== undefined) {
//       review.comment = updateReviewDto.comment;
//     }

//     try {
//       const updatedReview = await review.save(); // Use save() to trigger validation and timestamps

//       // If rating changed, recalculate product's average rating
//       if (updateReviewDto.rating !== undefined && oldRating !== updateReviewDto.rating) {
//         await this.recalculateProductRatingAndCount(productId);
//       }

//       return updatedReview;
//     } catch (error) {
//       if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
//         throw error; // Re-throw specific errors
//       }
//       throw new InternalServerErrorException('Failed to update review.');
//     }
//   }

//   /**
//    * Deletes a review by its unique ID.
//    * Revalidates ownership. Recalculates product rating after deletion.
//    * @param id The MongoDB ObjectId of the review to delete.
//    * @param userId The ID of the user attempting to delete (for authorization).
//    * @returns The deleted review document.
//    * @throws NotFoundException if the review is not found.
//    * @throws UnauthorizedException if the user is not the owner of the review.
//    */
//   async remove(id: string, userId: string): Promise<ReviewDocument> {
//     const review = await this.reviewModel.findById(id).exec();
//     if (!review) {
//       throw new NotFoundException(`Review with ID "${id}" not found.`);
//     }

//     // Authorization check: Ensure only the review's owner can delete it (or an admin)
//     // For admin, you'd add: || user.role === 'admin' after getting the user's role
//     if (review.userId.toString() !== userId.toString()) {
//       throw new UnauthorizedException('You are not authorized to delete this review.');
//     }

//     const productId = review.productId.toString(); // Get product ID before deletion

//     try {
//       const deletedReview = await this.reviewModel.findByIdAndDelete(id).exec();
//       if (!deletedReview) {
//         throw new NotFoundException(`Failed to delete. Review with ID "${id}" not found.`);
//       }
//       // Recalculate Product's average rating and number of reviews
//       await this.recalculateProductRatingAndCount(productId);

//       return deletedReview;
//     } catch (error) {
//       if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
//         throw error; // Re-throw specific errors
//       }
//       throw new InternalServerErrorException('Failed to delete review.');
//     }
//   }
// }


import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Review, ReviewDocument } from './entities/review.entity'; 
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProductsService } from '../products/products.service'; // Assuming ProductsService exists
import { UsersService } from '../users/users.service'; // Assuming UsersService exists

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
    // Validate productId and userId exist
    const product = await this.productsService.findById(createReviewDto.productId);
    if (!product) {
      throw new NotFoundException(`Product with ID "${createReviewDto.productId}" not found.`);
    }
    if (!createReviewDto.userId) {
      throw new BadRequestException('User ID is missing from the review DTO.');
    }
    
    const user = await this.usersService.findById(createReviewDto.userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${createReviewDto.userId}" not found.`);
    }

    // Optional: Prevent a user from reviewing the same product multiple times
    const existingReview = await this.reviewModel.findOne({
      userId: createReviewDto.userId,
      productId: createReviewDto.productId,
    }).exec();

    if (existingReview) {
      throw new ConflictException('You have already submitted a review for this product.');
    }

    try {
      const newReview = new this.reviewModel(createReviewDto);
      const savedReview = await newReview.save();

      // Optionally, add the review ID to the product's reviews array (if you have one)
      // This creates a bi-directional link, which can be useful but also adds complexity.
      // await this.productsService.addReviewToProduct(product._id.toString(), savedReview._id);

      return savedReview;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create review.');
    }
  }

  async findAll(
    productId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReviewDocument[]> {
    const filter: any = {};
    if (productId) {
      filter.productId = new Types.ObjectId(productId);
    }
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    return this.reviewModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email') // Populate user info
      .populate('productId', 'name') // Populate product info
      .exec();
  }

  async findById(id: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('productId', 'name')
      .exec();
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }

    // Prevent changing userId or productId after creation
    if (updateReviewDto.userId || updateReviewDto.productId) {
      throw new BadRequestException('User ID and Product ID cannot be changed in a review.');
    }

    Object.assign(review, updateReviewDto);
    try {
      return review.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update review.');
    }
  }

  async remove(id: string): Promise<ReviewDocument> {
    const deletedReview = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!deletedReview) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
    // Optionally, remove the review ID from the product's reviews array
    // await this.productsService.removeReviewFromProduct(deletedReview.productId.toString(), deletedReview._id);

    return deletedReview;
  }
}