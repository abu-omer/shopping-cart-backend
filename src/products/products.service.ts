


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

    const existingProduct = await this.productModel.findOne({ title: createProductDto.title }).exec();
    if (existingProduct) {
      throw new ConflictException('Product with this title already exists.');
    }

    if (createProductDto.categories?.length) {
      for (const categoryId of createProductDto.categories) {
        const category = await this.categoriesService.findById(categoryId.toString());
        if (!category) {
          throw new NotFoundException(`Category with ID "${categoryId}" not found.`);
        }
      }
    }

    const images: string[] = createProductDto.images || [];
    if (files && files.length > 0) {
      for (const file of files) {
        const imageFile = `http://localhost:3000/uploads/${file.filename}`;
        images.push(imageFile);
      }
    }

    // Create and save product
    const newProduct = new this.productModel({
      ...createProductDto,
      images,
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

  ): Promise<{ data: ProductDocument[]; total: number; page: number; limit: number }> {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

    const filter: any = {};
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
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .sort({ createdAt: -1 });

    if (populateReviews) {
      query.populate('reviews');
    }
    if (populateCategories) {
      query.populate('categories'); // Populate single category
    }

    const [data, total] = await Promise.all([
      this.productModel.find(filter)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .sort({ createdAt: -1 })
        .populate(populateReviews ? 'reviews' : '')
        .populate(populateCategories ? 'categories' : '')
        .exec(),
      this.productModel.countDocuments(filter).exec()
    ]);

    return { data, total, page: safePage, limit: safeLimit };
  }



  async findById(
    id: string,
    populateReviews: boolean = false,
    populateCategories: boolean = false,
  ): Promise<ProductDocument> {
    const isValidObjectId = Types.ObjectId.isValid(id) && (String(new Types.ObjectId(id)) === id);
    const filter = isValidObjectId ? { _id: id } : { id: Number(id) };
    const query = this.productModel.findOne(filter);

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

    if (updateProductDto.title && updateProductDto.title !== product.title) {
      const existingProductWithTitle = await this.productModel.findOne({ title: updateProductDto.title }).exec();
      if (existingProductWithTitle && existingProductWithTitle._id!.toString() !== id) {
        throw new ConflictException('Product with this title already exists.');
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
    if (updateProductDto.images !== undefined) {
      product.images = updateProductDto.images;
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


  async updatemany() {
    try {
      await this.productModel.collection.dropIndex('id_1');
    } catch (e) {
      console.log('Index drop ignored (might not exist):', e.message);
    }

    await this.productModel.updateMany(
      {},
      { $unset: { id: "" } },
    );
  }
}