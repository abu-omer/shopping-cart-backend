// import { forwardRef, Module } from '@nestjs/common';
// import { ReviewsService } from './reviews.service';
// import { ReviewsController } from './reviews.controller';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Review, ReviewSchema } from './entities/review.entity';
// import { ProductsModule } from 'src/products/products.module';
// import { UsersModule } from 'src/users/users.module';

// @Module({
//   imports:[MongooseModule.forFeature([{name: Review.name, schema: ReviewSchema}]),ProductsModule, // ✅ IMPORT it
//   forwardRef(() => UsersModule)],
//   controllers: [ReviewsController],
//   providers: [ReviewsService],
//   exports:[ReviewsService]
// })
// export class ReviewsModule {}



import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from './entities/review.entity'; 
import { ProductsModule } from '../products/products.module'; // Import ProductsModule
import { UsersModule } from '../users/users.module';     // Import UsersModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ProductsModule, // Make ProductsService available
    UsersModule,    // Make UsersService available
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService], // Export ReviewsService if other modules need it
})
export class ReviewsModule {}