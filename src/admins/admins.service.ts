import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './entities/admin.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) { }
  async create(createAdminDto: CreateAdminDto) {
    const { username, email, password } = createAdminDto

    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new BadRequestException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const newAdmin = new this.adminModel({
      username,
      email,
      password: hashedPassword
    })

    const savedAdmin = await newAdmin.save()

    const { password: _, ...result } = savedAdmin.toObject()
    return result

  }


  async findAll() {
    return await this.adminModel.find()
  }

  async findOne(id: string) {
    return await this.adminModel.findById({ _id: id })
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    return await this.adminModel.findByIdAndUpdate({ _id: id }, updateAdminDto, { new: true })
  }

  async remove(id: string) {
    return await this.adminModel.findByIdAndDelete({ _id: id })
  }
  async findByEmail(email: string) {
    console.log('email', email)
    return await this.adminModel.findOne({ email: email.trim() })
  }
}
