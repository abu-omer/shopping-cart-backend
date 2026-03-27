// // src/reviews/reviews.controller.ts

// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
//   Query,
//   UseGuards,
//   HttpStatus,
//   HttpCode,
//   UnauthorizedException,
// } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
//   ApiParam,
//   ApiQuery,
// } from '@nestjs/swagger';

// import { ReviewsService } from './reviews.service';
// import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Assuming you have this guard
// import { GetUser } from '../auth/decorators/get-user.decorator'; // Assuming you have this decorator
// import { User } from 'src/users/entities/user.entity'; // Import User schema/interface for GetUser type

// @ApiTags('Reviews') // Categorize endpoints in Swagger UI
// @Controller('reviews')
// export class ReviewsController {
//   constructor(private readonly reviewsService: ReviewsService) {}

//   @Post()
//   @UseGuards(JwtAuthGuard) // Protect this endpoint: only authenticated users can create reviews
//   @HttpCode(HttpStatus.CREATED) // Set HTTP status code for successful creation
//   @ApiOperation({ summary: 'Create a new product review' })
//   @ApiBearerAuth() // Indicate that a bearer token is required
//   @ApiResponse({
//     status: 201,
//     description: 'The review has been successfully created.',
//     // type: Review // If you have a Review response DTO/interface
//   })
//   @ApiResponse({ status: 400, description: 'Invalid input.' })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })
//   @ApiResponse({ status: 404, description: 'Product or User not found.' })
//   @ApiResponse({ status: 409, description: 'User has already reviewed this product.' })
//   async create(
//     @Body() createReviewDto: CreateReviewDto,
//     @GetUser() user: User, // Use custom decorator to get authenticated user object
//   ) {

//     if (!user || !user._id) {
//       throw new UnauthorizedException('User not authenticated or invalid');
//     }
//     // The userId is taken from the authenticated user, not from the request body, for security.
//     return this.reviewsService.create(createReviewDto, user._id!.toString());
//   }

//   @Get()
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Retrieve all reviews, optionally filtered by product or user' })
//   @ApiQuery({
//     name: 'productId',
//     required: false,
//     description: 'Filter reviews by a specific product ID',
//     type: String,
//   })
//   @ApiQuery({
//     name: 'userId',
//     required: false,
//     description: 'Filter reviews by a specific user ID',
//     type: String,
//   })
//   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
//   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reviews per page' })
//   @ApiQuery({ name: 'populateProduct', required: false, type: Boolean, description: 'Set to true to populate product details' })
//   @ApiQuery({ name: 'populateUser', required: false, type: Boolean, description: 'Set to true to populate user details' })
//   @ApiResponse({ status: 200, description: 'Successfully retrieved reviews.' })
//   async findAll(
//     @Query('productId') productId?: string,
//     @Query('userId') userId?: string,
//     @Query('page') page: number = 1,
//     @Query('limit') limit: number = 10,
//     @Query('populateProduct') populateProduct: string = 'false', // Query params are strings
//     @Query('populateUser') populateUser: string = 'false',
//   ) {
//     // Convert string 'true'/'false' to boolean
//     const doPopulateProduct = populateProduct === 'true';
//     const doPopulateUser = populateUser === 'true';

//     return this.reviewsService.findAll(
//       productId,
//       userId,
//       page,
//       limit,
//       doPopulateProduct,
//       doPopulateUser,
//     );
//   }

//   @Get(':id')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Retrieve a single review by ID' })
//   @ApiParam({ name: 'id', description: 'The ID of the review to retrieve', type: String })
//   @ApiQuery({ name: 'populateProduct', required: false, type: Boolean, description: 'Set to true to populate product details' })
//   @ApiQuery({ name: 'populateUser', required: false, type: Boolean, description: 'Set to true to populate user details' })
//   @ApiResponse({ status: 200, description: 'Successfully retrieved the review.' })
//   @ApiResponse({ status: 404, description: 'Review not found.' })
//   async findOne(
//     @Param('id') id: string,
//     @Query('populateProduct') populateProduct: string = 'false',
//     @Query('populateUser') populateUser: string = 'false',
//   ) {
//     const doPopulateProduct = populateProduct === 'true';
//     const doPopulateUser = populateUser === 'true';
//     return this.reviewsService.findById(id, doPopulateProduct, doPopulateUser);
//   }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard) // Protect this endpoint: only authenticated users can update reviews
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Update an existing review by ID' })
//   @ApiBearerAuth()
//   @ApiParam({ name: 'id', description: 'The ID of the review to update', type: String })
//   @ApiResponse({ status: 200, description: 'The review has been successfully updated.' })
//   @ApiResponse({ status: 400, description: 'Invalid input.' })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })
//   @ApiResponse({ status: 404, description: 'Review not found.' })
//   async update(
//     @Param('id') id: string,
//     @Body() updateReviewDto: UpdateReviewDto,
//     @GetUser() user: User, // Get the authenticated user for authorization
//   ) {
//     return this.reviewsService.update(id, updateReviewDto, user._id!.toString());
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard) // Protect this endpoint: only authenticated users can delete reviews
//   @HttpCode(HttpStatus.NO_CONTENT) // Set HTTP status code for successful deletion (no content returned)
//   @ApiOperation({ summary: 'Delete a review by ID' })
//   @ApiBearerAuth()
//   @ApiParam({ name: 'id', description: 'The ID of the review to delete', type: String })
//   @ApiResponse({ status: 204, description: 'The review has been successfully deleted.' })
//   @ApiResponse({ status: 401, description: 'Unauthorized.' })
//   @ApiResponse({ status: 404, description: 'Review not found.' })
//   async remove(@Param('id') id: string, @GetUser() user: User) {
//     await this.reviewsService.remove(id, user._id!.toString());
//     // Return no content for 204 status
//   }
// }

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Authenticated users can create reviews
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'The review has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product or User not found.' })
  @ApiResponse({ status: 409, description: 'User already reviewed this product.' })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User not authenticated or missing ID');
    }
    // Ensure the review is associated with the authenticated user
    createReviewDto.userId = user._id.toString();
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all reviews' })
  @ApiQuery({ name: 'productId', required: false, type: String, description: 'Filter reviews by product ID' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter reviews by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reviews per page' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved reviews.' })
  async findAll(
    @Query('productId') productId?: string,
    @Query('userId') userId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.findAll(productId, userId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single review by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the review to retrieve', type: String })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the review.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can update reviews
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing review by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the review to update', type: String })
  @ApiResponse({ status: 200, description: 'The review has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can delete reviews
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the review to delete', type: String })
  @ApiResponse({ status: 204, description: 'The review has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
  }
}