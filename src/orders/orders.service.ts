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
import { CheckoutDto } from './dto/checkout.dto';
import { ReceiptDto, ReceiptItemDto } from './dto/receipt.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { ProductDocument } from 'src/products/entities/product.entity';
import { CartModule } from 'src/cart/cart.module';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';

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



  async create(createOrderDto: any, userId: string): Promise<OrderDocument> {
    const { items, address, city, state, stateCode, postalCode, country, coordinates, shippingInstructions, paymentMethod } = createOrderDto;

    // Map flat fields into shippingAddress
    const shippingAddress = { address, city, state, stateCode, postalCode, country, coordinates };

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
        if (product.stock < itemDto.quantity) throw new BadRequestException(`Insufficient stock for ${product.title}`);

        const orderItem: OrderItem = {
          productId: new Types.ObjectId(itemDto.productId),
          productTitle: product.title,
          quantity: itemDto.quantity,
          price: product.price,
          images: product.images || [],
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
      
      // Return populated order
      return await this.findById(savedOrder._id.toString(), true);
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
    populateUser: boolean = true,
    search?: string,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const filter: any = {};
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }
    if (status) {
      filter.status = status;
    }

    if (search) {
      if (Types.ObjectId.isValid(search)) {
        filter._id = new Types.ObjectId(search);
      } else {
        // Search by order status or other simple fields if search is not an ID
        // For customer name search, it would require a lookup, but we'll stick to ID for now
        // as per the implementation plan's simplified approach.
      }
    }

    const query = this.orderModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (populateUser) {
      query.populate({
        path: 'userId',
        select: 'firstName lastName email phone image username',
      });
    }

    query.populate({
      path: 'items.productId',
      model: 'Product',
      select: 'title images price',
    });

    try {
      const total = await this.orderModel.countDocuments(filter).exec();
      const orders = await query.exec();

      const data = orders.map((order) => {
        const orderTotal = order.items.reduce((sum, item) => {
          const price =
            item.productId && typeof item.productId === "object" && "price" in item.productId
              ? (item.productId as any).price
              : (item.price || 0);
          return sum + price * item.quantity;
        }, 0);

        return {
          ...order.toObject(),
          total: orderTotal,
        };
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      // If a CastError occurs (e.g. invalid Product ID in DB), fallback to unpopulated items
      if (error.name === 'CastError') {
        this.logger.warn(`⚠️ Database Integrity Issue: A corrupted Product ID was found in your orders. Fallback mode activated. Error: ${error.message}`);

        // Fetch orders without product population to avoid the crash
        let ordersQuery = this.orderModel.find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 });

        if (populateUser) {
          ordersQuery = ordersQuery.populate({
            path: 'userId',
            select: 'firstName lastName email phone image username',
          });
        }

        const [orders, total] = await Promise.all([
          ordersQuery.exec(),
          this.orderModel.countDocuments(filter).exec(),
        ]);

        const data = orders.map(o => ({
          ...o.toObject(),
          total: o.totalAmount // Use stored total amount as fallback
        }));

        return { data, total, page, limit };
      }
      throw error;
    }
  }

  async findById(
    id: string,
    populateUser: boolean = true,
  ): Promise<OrderDocument> {
    let query = this.orderModel.findById(id);

    if (populateUser) {
      query = query.populate({
        path: 'userId',
        select: 'firstName lastName email phone image username',
      });
    }

    query = query.populate({
      path: 'items.productId',
      model: 'Product',
      select: 'title images price',
    });

    const order = await query.exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
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
      await order.save();

      if (newStatus && newStatus !== oldStatus) {
        if ((newStatus === 'cancelled' || newStatus === 'refunded') &&
          (oldStatus === 'processing' || oldStatus === 'shipped' || oldStatus === 'delivered')) {
          for (const item of order.items) {
            await this.productsService.incrementStock(item.productId.toString(), item.quantity);
          }
          this.logger.log(`Stock incremented for order ${id} due to status change from ${oldStatus} to ${newStatus}.`);
        }
      }

      return await this.findById(id, true);
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
    const orders = await this.orderModel.find({ userId: new Types.ObjectId(id) })
      .populate({
        path: 'userId',
        select: 'firstName lastName email phone image username',
      })
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'title images price',
      })
      .sort({ createdAt: -1 });
    console.log('order', orders);
    return orders;
  }

  // ── Checkout: build an order directly from the user's current cart ──────────
  async checkout(userId: string, checkoutDto: CheckoutDto): Promise<{ order: OrderDocument; receipt: ReceiptDto }> {
    const { address, city, state, stateCode, postalCode, country, paymentMethod, shippingInstructions } = checkoutDto;

    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.products || cart.products.length === 0) {
      throw new BadRequestException('Your cart is empty. Add items before checking out.');
    }

    const DELIVERY_FEE = 0; // Flat delivery fee — update as needed

    // Build order items from cart products
    const items = cart.products.map((p) => ({
      productId: p.productId?.toString() ?? '',
      quantity: p.quantity,
    }));

    const shippingAddress = { address, city, state, stateCode, postalCode, country };
    const order = await this.create(
      { items, address, city, state, stateCode, postalCode, country, shippingInstructions, paymentMethod },
      userId,
    );

    const receipt = this.buildReceipt(order, DELIVERY_FEE);
    return { order, receipt };
  }

  // ── Receipt: fetch a structured receipt for an existing order ───────────────
  async getReceipt(orderId: string, userId: string): Promise<ReceiptDto> {
    const order = await this.findById(orderId);
    if (order.userId.toString() !== userId) {
      throw new UnauthorizedException('You are not authorized to view this receipt.');
    }
    return this.buildReceipt(order, 0);
  }

  // ── Private helper ───────────────────────────────────────────────────────────
  private buildReceipt(order: OrderDocument, deliveryFee: number): ReceiptDto {
    const receiptItems: ReceiptItemDto[] = order.items.map((item) => {
      const unitPrice = item.price;
      return {
        title: item.productTitle,
        quantity: item.quantity,
        unitPrice,
        total: Number((unitPrice * item.quantity).toFixed(2)),
        image: item.images?.[0],
      };
    });

    const subtotal = Number(order.totalAmount.toFixed(2));
    const total = Number((subtotal + deliveryFee).toFixed(2));
    const receiptNumber = `ORD-${order._id!.toString().slice(-6).toUpperCase()}`;

    return {
      receiptNumber,
      orderId: order._id!.toString(),
      date: (order.createdAt ?? new Date()).toISOString(),
      items: receiptItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: order.paymentMethod ?? 'cash_on_delivery',
      paymentStatus: order.paymentStatus,
      status: order.status,
      shippingAddress: order.shippingAddress as any,
    };
  }
}