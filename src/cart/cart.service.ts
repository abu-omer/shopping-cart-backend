import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Cart, CartDocument, CartProduct } from './entities/cart.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsService: ProductsService,
  ) { }

  async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ userObjectId: new Types.ObjectId(userId) })
      .exec();

    if (!cart) {
      // Find the highest ID to increment
      const lastCart = await this.cartModel.findOne().sort({ id: -1 }).exec();
      const nextId = lastCart && lastCart.id ? lastCart.id + 1 : 1;

      // For numeric userId, we check if it exists on the user. 
      // If not, we could use a default or increment. 
      // Assuming for now it's mapping to an external system where userId 1 exists.
      cart = new this.cartModel({
        id: nextId,
        userObjectId: new Types.ObjectId(userId),
        userId: 1, // Default or map from user
        products: [],
        total: 0,
        discountedTotal: 0,
        totalProducts: 0,
        totalQuantity: 0,
      });
      await cart.save();
    }
    cart.lastAccessedAt = new Date();
    await cart.save();
    return cart;
  }

  async addItem(userId: string, addItemDto: AddItemToCartDto): Promise<CartDocument> {
    const { productId, quantity } = addItemDto;
    console.log("userId", userId, "productId", productId, "quantity", quantity)
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId,
    );

    if (existingProductIndex > -1) {
      const existingProduct = cart.products[existingProductIndex];
      const newQuantity = existingProduct.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add ${quantity} units. Only ${product.stock - existingProduct.quantity} more units of "${product.title}" available.`,
        );
      }

      existingProduct.quantity = newQuantity;
      existingProduct.total = Number((existingProduct.quantity * existingProduct.price).toFixed(2));
      existingProduct.discountedTotal = Number((existingProduct.total * (1 - (existingProduct.discountPercentage || 0) / 100)).toFixed(2));
    } else {
      if (quantity > product.stock) {
        throw new BadRequestException(
          `Cannot add ${quantity} units. Only ${product.stock} units of "${product.title}" available.`,
        );
      }

      const total = Number((quantity * product.price).toFixed(2));
      const discountPercentage = product.discountPercentage || 0;
      const discountedTotal = Number((total * (1 - discountPercentage / 100)).toFixed(2));

      const newCartProduct: CartProduct = {
        productId: product._id,
        title: product.title,
        quantity,
        price: product.price,
        total,
        discountPercentage,
        discountedTotal,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
      };
      cart.products.push(newCartProduct);
    }

    try {
      return await cart.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to add item to cart.');
    }
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId);

    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId,
    );

    if (existingProductIndex === -1) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart.`);
    }

    if (quantity === 0) {
      cart.products.splice(existingProductIndex, 1);
    } else {
      const product = await this.productsService.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID "${productId}" no longer exists.`);
      }

      if (quantity > product.stock) {
        throw new BadRequestException(
          `Cannot update quantity to ${quantity}. Only ${product.stock} units of "${product.title}" available.`,
        );
      }

      const existingProduct = cart.products[existingProductIndex];
      existingProduct.quantity = quantity;
      existingProduct.total = Number((existingProduct.quantity * existingProduct.price).toFixed(2));
      existingProduct.discountedTotal = Number((existingProduct.total * (1 - (existingProduct.discountPercentage || 0) / 100)).toFixed(2));
    }

    try {
      return await cart.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update cart item quantity.');
    }
  }

  async removeItem(userId: string, productId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId);
    const initialItemCount = cart.products.length;

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException(`Invalid product ID: "${productId}"`);
    }

    const productObjectId = new Types.ObjectId(productId);

    cart.products = cart.products.filter(product => {
      const currentId = product.productId instanceof Types.ObjectId
        ? product.productId
        : (product.productId as any)._id;

      return !currentId.equals(productObjectId);
    });

    if (cart.products.length === initialItemCount) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart.`);
    }

    try {
      return await cart.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove item from cart.');
    }
  }

  async clearCart(userId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId);
    cart.products = [];
    cart.total = 0;
    cart.discountedTotal = 0;
    cart.totalProducts = 0;
    cart.totalQuantity = 0;
    try {
      return await cart.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to clear cart.');
    }
  }


  async deleteCartByUserId(userId: string): Promise<CartDocument> {
    const deletedCart = await this.cartModel.findOneAndDelete({ userObjectId: new Types.ObjectId(userId) }).exec();
    if (!deletedCart) {
      throw new NotFoundException(`Cart for user ID "${userId}" not found.`);
    }
    console.log('user', userId)
    return deletedCart;
  }

  // async getOrCreateCart(userId: string): Promise<CartDocument> {
  //   let cart = await this.cartModel.findOne({ userId });

  //   if (!cart) {
  //     cart = await this.cartModel.create({ userId, items: [] });
  //   }

  //   return cart;
  // }

}