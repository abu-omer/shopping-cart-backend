import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Address, User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return newUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  async findByemail(email: string) {
    console.log('email', email)
    return await this.userModel.findOne({ email: email }).select('+password').exec();


  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    console.log('user11', updateUserDto)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateUserDto.email })
        .lean<User & { _id: Types.ObjectId }>()
        .exec();
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('User with this email already exists.');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Merge nested shippingAddress if it exists
    if (updateUserDto.shippingAddresses) {
      user.shippingAddresses = updateUserDto.shippingAddresses.map(addr => ({
        address: addr.address ?? '',
        city: addr.city ?? '',
        state: addr.state ?? '',
        stateCode: addr.stateCode ?? '',
        postalCode: addr.postalCode ?? '',
        coordinates: addr.coordinates ?? { lat: 0, lng: 0 },
        country: addr.country ?? 'United States',
      }));
    }

    const { shippingAddresses, ...rest } = updateUserDto;
    Object.assign(user, rest);

    // // Merge all other top-level fields
    // Object.assign(user, updateUserDto);

    try {
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error('Update error:', error);
      throw new InternalServerErrorException('Failed to update user.');
    }
  }


  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return deletedUser;
  }
  async updateShippingAddress(
    id: string,
    shippingAddress: Address
  ) {
    return this.userModel.findByIdAndUpdate(
      id,
      { $addToSet: { shippingAddresses: shippingAddress } },
      { new: true }
    );
  }


  async updatemany() {
    try {
      await this.userModel.collection.dropIndex('id_1');
    } catch (e) {
      console.log('Index drop ignored (might not exist):', e.message);
    }

    await this.userModel.updateMany(
      {},
      { $unset: { id: "" } },
      { strict: false },
    );
  }
}