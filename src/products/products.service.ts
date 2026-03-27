// import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { InjectModel } from '@nestjs/mongoose';
// import { Product, ProductDocument } from './entities/product.entity';
// import { Model, Types, ObjectId } from 'mongoose';
// import { CategoriesService } from 'src/categories/categories.service';
// import { SubCategoriesService } from 'src/sub-categories/sub-categories.service';
// import { Category, CategoryDocument } from 'src/categories/entities/category.entity';
// import { SubCategory, SubCategoryDocument } from 'src/sub-categories/entities/sub-category.entity';
// import { Order, OrderDocument } from 'src/orders/entities/order.entity';
// import { CartService } from 'src/cart/cart.service';

// @Injectable()
// export class ProductsService {
//   constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>,
//     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
//     @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
//     @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
//     @Inject(forwardRef(() => CartService)) private cartService: CartService,
//     private readonly categoryService: CategoriesService,
//     private readonly subCategoryService: SubCategoriesService,

//   ) { }

//   async createOrderFromCart(userId: string): Promise<OrderDocument> {
//     const cart = await this.cartService.getOrCreateCart(userId);

//     if (!cart.items.length) {
//       throw new BadRequestException('Cart is empty');
//     }

//     // Create order
//     const order = new this.orderModel({
//       userId,
//       items: cart.items.map(item => ({
//         productId: item.productId,
//         productName: item.productName,
//         quantity: item.quantity,
//         price: item.price,
//         imageFiles: item.imageFiles,
//       })),
//       totalPrice: cart.totalPrice,
//     });

//     await order.save();

//     // OPTIONAL: reduce product stock
//     for (const item of cart.items) {
//       await this.decreaseStock(
//         item.productId.toString(),
//         item.quantity,
//       );
//     }

//     // Clear cart after successful order
//     cart.items = [];
//     cart.totalPrice = 0;
//     await cart.save();

//     return order;
//   }

//   async create(createProductDto: CreateProductDto) {
//     const { categoriesId, subCategoriesId, ...rest } = createProductDto;

//     const category = await this.categoryModel.findById(categoriesId);
//     if (!category) throw new NotFoundException('Category not found');

//     let subCategory: any = null;
//     if (subCategoriesId) {
//       subCategory = await this.subCategoryModel.findById(subCategoriesId);
//       if (!subCategory) throw new NotFoundException('SubCategory not found');
//     }

//     const product = await this.productModel.create({
//       ...rest,
//       categoriesId,
//       subCategoriesId,
//     });

//     await this.categoryModel.findByIdAndUpdate(categoriesId.toString(), {
//       $push: { productsId: product._id },
//     });
//     console.log('categoriesId', categoriesId)
//     console.log('subCategoriesId', subCategoriesId)

//     if (subCategoriesId) {
//       await this.subCategoryModel.findByIdAndUpdate(subCategoriesId.toString(), {
//         $push: { productsId: product._id },
//       });
//     }

//     return product;
//   }


//   async findAll() {
//     const products = await this.productModel
//       .find()
//       .populate('categoriesId', 'name')
//       .populate('subCategoriesId', 'name')
//       .exec();
//     return products;
//   }
//   async getProductByCat(id: string) {

//     const products = await this.productModel.find({
//       categoriesId: id
//     }).exec();

//     return products;
//   }
//   async searchProduct(query: string) {
//     console.log('query', query)
//     return await this.productModel.find({
//       name: { $regex: query, $options: "i" }
//     });
//   }
//   async findOne(id: string) {
//     return await this.productModel.findById(id)
//   }
//   async getProductsBySub(id: string) {

//     const products = await this.productModel.find({
//       subCategoriesId: id
//     }).exec();

//     return products;
//   }




//   async update(id: string, updateProductDto: UpdateProductDto & { removeImages?: string[] }): Promise<ProductDocument> {
//     console.log('update', updateProductDto)
//     const product = await this.productModel.findById(id).exec();
//     if (!product) {
//       throw new NotFoundException(`Product with ID "${id}" not found.`);
//     }

//     if (updateProductDto.name && updateProductDto.name !== product.name) {
//       console.log('name', updateProductDto.name)
//       const existingProduct = await this.productModel.findOne({ name: updateProductDto.name }).exec();
//       if (existingProduct && existingProduct._id.toString() !== id) {
//         throw new ConflictException('Product with this name already exists.');
//       }
//     }


//     if (updateProductDto.imageFiles?.length) {
//       product.imageFiles?.push(...updateProductDto.imageFiles);
//     }

//     if (updateProductDto.removeImages?.length) {
//       product.imageFiles = product.imageFiles?.filter(img => !updateProductDto.removeImages!.includes(img));
//     }

//     // --- CATEGORY ---
//     if (updateProductDto.categoriesId) {
//       const newCategoryId = updateProductDto.categoriesId.toString();
//       console.log('newCategoryId', newCategoryId)
//       console.log('product.categoriesId', product.categoriesId)
//       if (!product.categoriesId || product.categoriesId.toString() !== newCategoryId) {

//         // Remove from old category
//         if (product.categoriesId) {
//           await this.categoryModel.findByIdAndUpdate(product.categoriesId.toString(), {
//             $pull: { productsId: product._id },
//           });
//         }

//         // Add to new category
//         await this.categoryModel.findByIdAndUpdate(newCategoryId, {
//           $addToSet: { productsId: product._id },
//         });

//         product.categoriesId = new Types.ObjectId(newCategoryId);
//       }
//     }

//     // --- SUBCATEGORY ---
//     if (updateProductDto.subCategoriesId) {
//       const newSubCategoryId = updateProductDto.subCategoriesId.toString();
//       console.log('newSubCategoryId', newSubCategoryId)
//       console.log('product.subCategoriesId', product.subCategoriesId)

//       if (!product.subCategoriesId || product.subCategoriesId.toString() !== newSubCategoryId) {
//         // Remove from old subcategory
//         if (product.subCategoriesId) {
//           await this.subCategoryModel.findByIdAndUpdate(
//             product.subCategoriesId.toString(),
//             { $pull: { productsId: product._id } }
//           );
//         }

//         // Add to new subcategory
//         await this.subCategoryModel.findByIdAndUpdate(newSubCategoryId, {
//           $addToSet: { productsId: product._id },
//         });

//         product.subCategoriesId = new Types.ObjectId(newSubCategoryId);
//       }
//     }




//     const { imageFiles, removeImages, categoriesId, subCategoriesId, ...rest } = updateProductDto;
//     Object.assign(product, rest);
//     console.log('pro', product)
//     try {
//       return await product.save();
//     } catch (error) {
//       throw new InternalServerErrorException('Failed to update product.');
//     }
//   }

//   async remove(id: string) {
//     return await this.productModel.findOneAndDelete({ _id: id })
//   }

//   async findById(id: string) {
//     return await this.productModel.findById(id)
//   }
//   async decreaseStock(productId: string, quantity: number) {
//     const product = await this.productModel.findById(productId);

//     if (!product || product.stock < quantity) {
//       throw new BadRequestException('Insufficient stock');
//     }

//     product.stock -= quantity;
//     await product.save();
//   }

// }


import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';



@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) { }
  async create(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductDocument> {

    // Parse categories if it's a string (from multipart form data)
    if (typeof createProductDto.categories === 'string') {
      try {
        createProductDto.categories = JSON.parse(createProductDto.categories);
      } catch (error) {
        throw new BadRequestException('Invalid categories format. Must be a JSON array.');
      }
    }

    const existingProduct = await this.productModel.findOne({ name: createProductDto.name }).exec();
    if (existingProduct) {
      throw new ConflictException('Product with this name already exists.');
    }

    if (createProductDto.categories?.length) {
      for (const categoryId of createProductDto.categories) {
        const category = await this.categoriesService.findById(categoryId.toString());
        if (!category) {
          throw new NotFoundException(`Category with ID "${categoryId}" not found.`);
        }
      }
    }

    const imageFiles: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const imageFile = `http://localhost:3000/uploads/${file.filename}`;
        imageFiles.push(imageFile);
      }
    }

    // Create and save product
    const newProduct = new this.productModel({
      ...createProductDto,
      imageFiles,
      categories: createProductDto.categories?.map(id => new Types.ObjectId(id)) || [],
    });

    return await newProduct.save();
  }








  async findAll(
    page: number = 1,
    limit: number = 10,
    populateReviews: boolean = false,
    populateCategories: boolean = false,
    category?: string,

  ): Promise<ProductDocument[]> {
    const filter: any = {};
    console.log('cat', category)
    if (category) {
      try {
        const categoryIds = Array.isArray(category)
          ? category.map((id) => new Types.ObjectId(id))
          : [new Types.ObjectId(category)];

        filter.categories = { $in: categoryIds };
      } catch {
        // fallback: use raw string
        filter.categories = category;
      }
    }
    const query = this.productModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (populateReviews) {
      query.populate('reviews');
    }
    if (populateCategories) {
      query.populate('categories');
    }

    return query.exec();
  }



  async findById(
    id: string,
    populateReviews: boolean = false,
    populateCategories: boolean = false,
  ): Promise<ProductDocument> {
    const query = this.productModel.findById(id);

    if (populateReviews) {
      query.populate('reviews');
    }
    if (populateCategories) {
      query.populate('categories'); // Populate single category
    }

    const product = await query.exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProductWithName = await this.productModel.findOne({ name: updateProductDto.name }).exec();
      if (existingProductWithName && existingProductWithName._id!.toString() !== id) {
        throw new ConflictException('Product with this name already exists.');
      }
    }

    // Validate categories
    if (updateProductDto.categories) {
      if (!Array.isArray(updateProductDto.categories)) {
        throw new BadRequestException('Categories must be an array of category IDs.');
      }

      const validatedCategoryIds: Types.ObjectId[] = [];

      for (const categoryId of updateProductDto.categories) {
        const category = await this.categoriesService.findById(categoryId.toString());
        if (!category) {
          throw new NotFoundException(`Category with ID "${categoryId}" not found.`);
        }
        validatedCategoryIds.push(new Types.ObjectId(categoryId));
      }

      updateProductDto.categories = validatedCategoryIds;
    }

    // Update image URLs if provided
    if (updateProductDto.imageFiles !== undefined) {
      product.imageFiles = updateProductDto.imageFiles;
    }

    Object.assign(product, updateProductDto);

    try {
      return product.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update product.');
    }
  }

  async remove(id: string): Promise<ProductDocument> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found.`); // ❌ you had `new new`
    }
    return deletedProduct;
  }

  // async decrementStock(productId: string, quantity: number): Promise<ProductDocument> {
  //   const product = await this.productModel.findById(productId).exec();
  //   if (!product) {
  //     throw new NotFoundException(`Product with ID "${productId}" not found.`);
  //   }

  //   if (product.stock < quantity) {
  //     throw new BadRequestException(`Insufficient stock for product "${product.name}".`);
  //   }

  //   product.stock -= quantity;
  //   return product.save();
  // }
  async decrementStock(productId: string, qty: number, session: ClientSession) {
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: -qty } },
      { session }
    );
  }

  async incrementStock(productId: string, quantity: number): Promise<ProductDocument> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }
    product.stock += quantity;
    return product.save();
  }
}