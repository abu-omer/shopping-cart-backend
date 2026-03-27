import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './entities/product.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from 'src/categories/categories.module';
import { SubCategoriesModule } from 'src/sub-categories/sub-categories.module';
import { Category, CategorySchema } from 'src/categories/entities/category.entity';
import { SubCategory, SubCategorySchema } from 'src/sub-categories/entities/sub-category.entity';
import { CartModule } from 'src/cart/cart.module';
import { Order, OrderSchema } from 'src/orders/entities/order.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema },
    { name: Category.name, schema: CategorySchema },
    { name: SubCategory.name, schema: SubCategorySchema },
    { name: Order.name, schema: OrderSchema },
  ]), CategoriesModule, SubCategoriesModule, forwardRef(() => CartModule),],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
