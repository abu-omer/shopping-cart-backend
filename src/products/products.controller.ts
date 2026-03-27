// import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Query } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { extname } from 'path';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { diskStorage } from 'multer';


// @Controller('products')
// export class ProductsController {
//   constructor(private readonly productsService: ProductsService) { }


//   @Post()
//   @UseInterceptors(
//     FileFieldsInterceptor(
//       [
//         { name: 'imageFiles', maxCount: 5 },
//       ],
//       {
//         storage: diskStorage({
//           destination: './uploads/products',
//           filename: (req, file, callback) => {
//             const uniqueSuffix =
//               Date.now() + '-' + Math.round(Math.random() * 1e9);
//             callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
//           },
//         }),
//       },
//     ),
//   )
//   async create(
//     @UploadedFiles()
//     files: { image?: Express.Multer.File[]; imageFiles?: Express.Multer.File[] },
//     @Body() createProductDto: CreateProductDto,
//   ) {

//     if (files.imageFiles && files.imageFiles.length > 0) {
//       createProductDto.imageFiles = files.imageFiles.map((f) => f.filename);
//     }

//     return this.productsService.create(createProductDto);
//   }
//   @Get()
//   findAll() {
//     return this.productsService.findAll()
//   }

//   @Get('search')
//   async search(@Query('query') query: string) {
//     console.log('query1', query)
//     if (!query || query.trim() === "") return [];
//     return await this.productsService.searchProduct(query)
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.productsService.findOne(id);
//   }



//   @Patch(':id')
//   @UseInterceptors(
//     FileFieldsInterceptor(
//       [
//         { name: 'image', maxCount: 1 },
//         { name: 'imageFiles', maxCount: 5 },
//       ],
//       {
//         storage: diskStorage({
//           destination: './uploads/products',
//           filename: (req, file, callback) => {
//             const uniqueSuffix =
//               Date.now() + '-' + Math.round(Math.random() * 1e9);
//             callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
//           },
//         }),
//       },
//     ),
//   )
//   async update(
//     @Param('id') id: string,
//     @UploadedFiles()
//     files: { image?: Express.Multer.File[]; imageFiles?: Express.Multer.File[] },
//     @Body() body: any,
//   ) {
//     files = files || {};

//     const updateProductDto: UpdateProductDto & { removeImages?: string[] } = {
//       ...body,
//       image: files.image?.[0]?.filename,
//       imageFiles: files.imageFiles?.map((f) => f.filename),
//     };

//     // Convert numeric fields
//     if (updateProductDto.price) updateProductDto.price = Number(updateProductDto.price);
//     if (updateProductDto.stock) updateProductDto.stock = Number(updateProductDto.stock);

//     // Parse removeImages if sent as JSON string
//     if (typeof updateProductDto.removeImages === 'string') {
//       updateProductDto.removeImages = JSON.parse(updateProductDto.removeImages);
//     }

//     return this.productsService.update(id, updateProductDto);
//   }



//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.productsService.remove(id);
//   }
//   @Get('sub/:subId')
//   async getProductsBySub(@Param('subId') subId: string) {
//     return this.productsService.getProductsBySub(subId);
//   }
//   @Get('cat/:id')
//   async getProductByCategory(@Param('id') id: string) {
//     return await this.productsService.getProductByCat(id)
//   }
// }


import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors, // Import UseInterceptors
  UploadedFiles,
  Patch,    // Import UploadedFiles
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody// Import ApiConsumes for Swagger
} from '@nestjs/swagger';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'; // Import FilesInterceptor

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product with image files (Admin only)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('imageFiles', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const createProductDto: CreateProductDto = {
      ...body,
      categories: typeof body.categories === 'string' ? JSON.parse(body.categories) : body.categories,
      price: Number(body.price),
      stock: Number(body.stock),
    };

    return this.productsService.create(createProductDto, files ?? []);
  }



  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products per page' })
  @ApiQuery({ name: 'populateReviews', required: false, type: Boolean, description: 'Set to true to populate reviews data' })
  @ApiQuery({ name: 'populateCategories', required: false, type: Boolean, description: 'Set to true to populate category data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved products.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('populateReviews') populateReviews: string = 'false',
    @Query('populateCategories') populateCategories: string = 'false',
    @Query('category') categoryId?: string,
  ) {
    const doPopulateReviews = populateReviews === 'true';
    const doPopulateCategories = populateCategories === 'true';
    return this.productsService.findAll(page, limit, doPopulateReviews, doPopulateCategories, categoryId);
  }



  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product to retrieve', type: String })
  @ApiQuery({ name: 'populateReviews', required: false, type: Boolean, description: 'Set to true to populate reviews data' })
  @ApiQuery({ name: 'populateCategories', required: false, type: Boolean, description: 'Set to true to populate category data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(
    @Param('id') id: string,
    @Query('populateReviews') populateReviews: string = 'false',
    @Query('populateCategories') populateCategories: string = 'false',
  ) {
    const doPopulateReviews = populateReviews === 'true';
    const doPopulateCategories = populateCategories === 'true';
    return this.productsService.findById(id, doPopulateReviews, doPopulateCategories);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing product by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the product to update', type: String })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 409, description: 'Product name already exists.' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // Note: For updating images, you would typically have a separate endpoint
    // or handle file uploads in the PUT request with careful logic to
    // add/remove/replace existing images. This example focuses on 'create'.
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the product to delete', type: String })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}