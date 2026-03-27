import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';

import { Order, OrderDocument, OrderItem } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { ProductDocument } from 'src/products/entities/product.entity';
import { CartModule } from 'src/cart/cart.module';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
    // Assuming CartService and its module exist and are properly imported/exported
    private cartService: CartService,
    private usersService: UsersService,
  ) { }

  // async create(createOrderDto: CreateOrderDto, userId: string): Promise<OrderDocument> {
  //   const { items, shippingAddress, shippingInstructions, paymentMethod } = createOrderDto;
  //   const { street, city, state, zipCode, country } = shippingAddress;

  //   if (!items || items.length === 0) {
  //     throw new BadRequestException('Order cannot be placed without items.');
  //   }

  //   const orderItems: OrderItem[] = [];
  //   let calculatedTotalAmount = 0;
  //   const session = await this.orderModel.db.startSession();
  //   session.startTransaction();

  //   try {
  //     for (const itemDto of items) {
  //       const product: ProductDocument = await this.productsService.findById(itemDto.productId);

  //       if (!product) {
  //         throw new NotFoundException(`Product with ID "${itemDto.productId}" not found.`);
  //       }
  //       if (product.stock < itemDto.quantity) {
  //         throw new BadRequestException(`Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${itemDto.quantity}`);
  //       }

  //       const orderItem: OrderItem = {
  //         productId: new Types.ObjectId(itemDto.productId),
  //         productName: product.name,
  //         quantity: itemDto.quantity,
  //         price: product.price,
  //         imageFiles: product.imageFiles
  //       };
  //       orderItems.push(orderItem);
  //       calculatedTotalAmount += orderItem.quantity * orderItem.price;
  //     }



  //     const createdOrder = new this.orderModel({
  //       userId: new Types.ObjectId(userId),
  //       items: orderItems,
  //       totalAmount: calculatedTotalAmount,
  //       shippingAddress,
  //       shippingInstructions,
  //       paymentMethod,
  //       paymentStatus: 'pending',
  //       status: 'pending',
  //     });

  //     const savedOrder = await createdOrder.save({ session });
  //     await this.usersService.updateShippingAddress(userId,
  //       shippingAddress
  //     );

  //     for (const item of orderItems) {
  //       await this.productsService.decrementStock(
  //         item.productId.toString(),
  //         item.quantity,
  //         session
  //       );
  //     }

  //     // Uncomment this line and ensure CartService is correctly injected if you have a cart module
  //     // await this.cartService.clearCart(userId);

  //     await session.commitTransaction();
  //     await this.cartService.clearCart(userId)
  //     return savedOrder;
  //   } catch (error) {
  //     await session.abortTransaction();
  //     this.logger.error(`Order creation failed for user ${userId}: ${error.message}`, error.stack);
  //     if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException('Failed to create order. Please try again.');
  //   } finally {
  //     session.endSession();
  //   }
  // }

  async create(createOrderDto: any, userId: string): Promise<OrderDocument> {
    const { items, street, city, state, zipCode, country, shippingInstructions, paymentMethod } = createOrderDto;

    // Map flat fields into shippingAddress
    const shippingAddress = { street, city, state, zipCode, country };

    if (!items || items.length === 0) {
      throw new BadRequestException('Order cannot be placed without items.');
    }

    const orderItems: OrderItem[] = [];
    let calculatedTotalAmount = 0;
    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      for (const itemDto of items) {
        const product = await this.productsService.findById(itemDto.productId);
        if (!product) throw new NotFoundException(`Product not found: ${itemDto.productId}`);
        if (product.stock < itemDto.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);

        const orderItem: OrderItem = {
          productId: new Types.ObjectId(itemDto.productId),
          productName: product.name,
          quantity: itemDto.quantity,
          price: product.price,
          imageFiles: product.imageFiles || [],
        };

        orderItems.push(orderItem);
        calculatedTotalAmount += orderItem.quantity * orderItem.price;
      }

      const createdOrder = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: orderItems,
        totalAmount: calculatedTotalAmount,
        shippingAddress, // now always defined
        shippingInstructions,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
      });

      const savedOrder = await createdOrder.save({ session });

      await this.usersService.updateShippingAddress(userId, shippingAddress);

      for (const item of orderItems) {
        await this.productsService.decrementStock(item.productId.toString(), item.quantity, session);
      }

      await this.cartService.clearCart(userId);

      await session.commitTransaction();
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Order creation failed for user ${userId}: ${error.message}`, error.stack);
      throw error;
    } finally {
      session.endSession();
    }
  }


  async findAll(
    userId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    populateUser: boolean = false,
  ): Promise<(Order & { total: number })[]> {
    const filter: any = {};
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }
    if (status) {
      filter.status = status;
    }

    const query = this.orderModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (populateUser) {
      query.populate({
        path: 'userId',
        select: 'firstName lastName',
      });
    }

    query.populate({
      path: 'items.productId',
      model: 'Product',
      select: 'name imageFiles price',
    });

    const orders = await query.exec();


    return orders.map((order) => {
      const total = order.items.reduce((sum, item) => {
        const price =
          typeof item.productId === "object" && "price" in item.productId
            ? item.productId.price
            : 0;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...order.toObject(),
        total, // 💰 Now available to frontend
      };
    });
  }

  async findById(
    id: string,
    populateUser: boolean = false,
  ): Promise<OrderDocument> {
    let query = this.orderModel.findById(id);

    if (populateUser) {
      query = query.populate('userId');
    }

    query.populate({
      path: 'items.productId',
      model: 'Product',
      select: 'name imageFiles price',
    });

    const order = await query.exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    const oldStatus = order.status;
    const newStatus = updateOrderDto.status;

    Object.assign(order, updateOrderDto);

    try {
      const updatedOrder = await order.save();

      if (newStatus && newStatus !== oldStatus) {
        if ((newStatus === 'cancelled' || newStatus === 'refunded') &&
          (oldStatus === 'processing' || oldStatus === 'shipped' || oldStatus === 'delivered')) {
          for (const item of updatedOrder.items) {
            await this.productsService.incrementStock(item.productId.toString(), item.quantity);
          }
          this.logger.log(`Stock incremented for order ${id} due to status change from ${oldStatus} to ${newStatus}.`);
        }
      }

      return updatedOrder;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update order.');
    }
  }

  async remove(id: string): Promise<OrderDocument> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    for (const item of deletedOrder.items) {
      await this.productsService.incrementStock(item.productId.toString(), item.quantity);
    }
    this.logger.warn(`Order ${id} has been permanently deleted and stock re-added. This operation is generally discouraged.`);

    return deletedOrder;
  }
  async myOrders(id: string) {
    const orders = await this.orderModel.find({ userId: new Types.ObjectId(id) });
    console.log('order', orders)
    return orders
  }
}