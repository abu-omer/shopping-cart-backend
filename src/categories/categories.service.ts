import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  constructor(

    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, isActive } = createCategoryDto

    const CategoryExist = await this.categoryModel.findOne({ name })
    if (CategoryExist) {
      throw new BadRequestException('category already exist')
    }

    return await this.categoryModel.create(createCategoryDto)
  }

  async findAll() {
    return await this.categoryModel.find().populate('subCategories', "name").exec();
  }
  async searchCat(query: string) {
    console.log('query', query)
    return await this.categoryModel.find({
      name: { $regex: query, $options: "i" }
    });
  }

  async findOne(id: string) {
    return await this.categoryModel.findById(id).populate('subCategories').exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, isActive } = updateCategoryDto
    console.log("update", name, isActive)
    const CategoryExist = await this.categoryModel.findOne({ name })
    if (CategoryExist) {
      throw new BadRequestException('category already exist')
    }
    return await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true })
  }

  async remove(id: string) {
    return await this.categoryModel.findByIdAndDelete(id)
  }

  async addSubCategory(categoryId: string, subCategoryId: Types.ObjectId) {
    return this.categoryModel.findByIdAndUpdate(
      categoryId,
      { $push: { subCategories: subCategoryId } },
      { new: true },
    );
  }

  async findCategoryById(id: string) {
    return this.categoryModel.findByIdAndUpdate(id)
  }

  async findById(
    id: string,
    populateProducts: boolean = false,
    populateHierarchy: boolean = false,
  ): Promise<CategoryDocument> {
    const query = this.categoryModel.findById(id);

    if (populateProducts) {
      query.populate('products');
    }
    if (populateHierarchy) {
      query.populate('parentCategory').populate('subCategories');
    }

    const category = await query.exec();
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return category;
  }

}
