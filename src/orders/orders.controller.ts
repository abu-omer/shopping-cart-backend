// src/orders/orders.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  UnauthorizedException,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Assuming you have a RolesGuard
import { Roles } from '../auth/decorators/roles.decorator'; // Assuming you have a Roles decorator
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { isValidObjectId } from 'mongoose';

@ApiTags('Orders') // Categorize endpoints in Swagger UI
@Controller('orders')
@UseGuards(JwtAuthGuard) // All order operations require authentication by default
@ApiBearerAuth() // Indicate that a bearer token is required for all endpoints
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order from current cart items' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
    // type: Order // If you have an Order response DTO/interface
  })
  @ApiResponse({ status: 400, description: 'Invalid input, product out of stock, or cart empty.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    // The userId is automatically taken from the authenticated user
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }
    return this.ordersService.create(createOrderDto, user._id.toString());
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all orders (admin) or all orders for the authenticated user (customer)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter orders by status (e.g., pending, delivered)',
    type: String,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of orders per page' })
  @ApiQuery({ name: 'populateUser', required: false, type: Boolean, description: 'Set to true to populate user details (admin only)' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved orders.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(
    @GetUser() user: any,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('populateUser') populateUser: string = 'true',
    @Query('search') search?: string,
  ) {
    const doPopulateUser = populateUser === 'true';
    const userIdFilter = (user.role === 'admin' || user.role === 'superAdmin') ? undefined : user._id?.toString();

    return await this.ordersService.findAll(
      userIdFilter,
      status,
      page,
      limit,
      doPopulateUser && (user.role === 'admin' || user.role === 'superAdmin'),
      search,
    );
  }
  @Get('myorders')
  async getMyOrders(@GetUser() user: User) {
    console.log('Fetching myorders for user ID:', user._id);
    console.log('User role:', user.role);

    if (!user._id) {
      throw new UnauthorizedException('User ID is missing.');
    }
    return this.ordersService.myOrders(user._id.toString());
  }
  // ── POST /orders/checkout ─────────────────────────────────────────────────
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Checkout: convert current cart into an order' })
  @ApiResponse({ status: 201, description: 'Order placed successfully with receipt.' })
  @ApiResponse({ status: 400, description: 'Cart is empty or stock issue.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async checkout(
    @Body() checkoutDto: CheckoutDto,
    @GetUser() user: User,
  ) {
    if (!user || !user._id) throw new UnauthorizedException('User is not authenticated');
    return this.ordersService.checkout(user._id.toString(), checkoutDto);
  }

  // ── GET /orders/:id/receipt ────────────────────────────────────────────────
  @Get(':id/receipt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the receipt for a specific order' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Receipt returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getReceipt(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    if (!user || !user._id) throw new UnauthorizedException('User is not authenticated');
    return this.ordersService.getReceipt(id, user._id.toString());
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single order by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the order to retrieve', type: String })
  @ApiQuery({ name: 'populateUser', required: false, type: Boolean, description: 'Set to true to populate user details' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the order.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (if not order owner or admin).' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('populateUser') populateUser: string = 'false',
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid order ID: ${id}`);
    }
    const order = await this.ordersService.findById(id, populateUser === 'true');

    // Authorization check: Only the order owner or an admin can view the order
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }
    if (order.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new ForbiddenException('You are not authorized to view this order.');
    }

    return order;
  }

  @Patch(':id')
  @UseGuards(RolesGuard) // Apply RolesGuard
  @Roles('admin') // Only users with 'admin' role can update orders
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing order by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'The ID of the order to update', type: String })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or invalid status transition.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) // Apply RolesGuard
  @Roles('admin') // Only users with 'admin' role can delete orders
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content is common for successful deletion
  @ApiOperation({ summary: 'Delete an order by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'The ID of the order to delete', type: String })
  @ApiResponse({ status: 204, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    // No content to return for 204 status
  }


}