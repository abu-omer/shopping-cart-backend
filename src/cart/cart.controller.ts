import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retrieve the authenticated user's shopping cart" })
  @ApiResponse({ status: 200, description: "Successfully retrieved the user's cart.", type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorizedooo.' })
  async getMyCart(@GetUser() user: User) {
    console.log("user", user)
    if (!user || !user._id) {

      throw new UnauthorizedException('User is not authenticated');
    }

    return this.cartService.getOrCreateCart(user._id.toString());
  }


  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a product to the cart or update its quantity if already present' })
  @ApiResponse({ status: 200, description: 'Product added/updated in cart successfully.', type: CartDto })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async addItemToCart(@Body() addItemDto: AddItemToCartDto, @GetUser() user: User) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }


    return this.cartService.addItem(user._id.toString(), addItemDto);
  }

  @Patch('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the quantity of a specific product in the cart' })
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product to update in the cart',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Cart item quantity updated successfully.', type: CartDto })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found in cart.' })
  async updateItemQuantity(
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetUser() user: User,
  ) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return this.cartService.updateItemQuantity(user._id.toString(), productId, updateCartItemDto.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a specific product from the cart' })
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product to remove from the cart',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Product removed from cart successfully.', type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found in cart.' })
  async removeItemFromCart(@Param('productId') productId: string, @GetUser() user: User) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }

    const updatedCart = await this.cartService.removeItem(user._id.toString(), productId);
    return updatedCart;

  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the shopping cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully.', type: CartDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async clearMyCart(@GetUser() user: User) {
    if (!user || !user._id) {
      throw new UnauthorizedException('User is not authenticated');
    }

    const updatedCart = await this.cartService.clearCart(user._id.toString());
    return updatedCart
  }
}