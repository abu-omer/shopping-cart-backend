

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  Patch,
  ForbiddenException,
  UploadedFile, // Added Query import
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()

  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()

  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.usersService.findAll(Number(page), Number(limit), search);
  }

  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Get details of the authenticated user' })
  // @ApiResponse({ status: 200, description: 'Successfully retrieved user profile.' })
  // @ApiResponse({ status: 401, description: 'Unauthorized.' })
  // async getMyProfile(@GetUser() user: User) {
  //   const { password: _, ...result } = user;
  //   console.log('user',result)
  //   return result;
  // }

  @Get(':id')

  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch("updatemany")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Successfully retrieved products.' })
  async updatemany() {
    return this.usersService.updatemany();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'The ID of the user to update', type: String })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires admin role).' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Email already exists for another user.' })

  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser() user: User,
    // @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('id', id)
    console.log('userId', user._id)
    if (user.role !== 'admin' && user._id?.toString() !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    console.log('dto', updateUserDto);

    return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')

  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
