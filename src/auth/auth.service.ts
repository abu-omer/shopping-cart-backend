import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AdminsService } from 'src/admins/admins.service';
import { UserDocument } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/Login.dto';
import { CreateUserDto } from './dto/Signup.dto';
import { User } from './entities/user.entity';
import { CreateAdminDto } from 'src/admins/dto/create-admin.dto';
// import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  // private client: OAuth2Client;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private readonly configService: ConfigService, private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,

    private readonly jwtService: JwtService) {
    // this.client = new OAuth2Client(
    //   this.configService.get<string>('GOOGLE_CLIENT_ID'),
    // );
  }





  // async googleLogin(idToken: string) {
  //   const ticket = await this.client.verifyIdToken({
  //     idToken,
  //     audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
  //   });

  //   const payload = ticket.getPayload();
  //   if (!payload) {
  //     throw new UnauthorizedException('Invalid Google token');
  //   }

  //   const { email, name, picture, sub } = payload;

  //   let user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     user = await this.userModel.create({
  //       email,
  //       name,
  //       googleId: sub,
  //       avatar: picture,
  //     });
  //   }

  //   const token = this.jwtService.sign({
  //     userId: user._id,
  //     email: user.email,
  //   });

  //   return { token, user };
  // }



  async AdminLogin(loginDto: LoginDto) {
    if (!loginDto) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { email, password } = loginDto

    const admin = await this.adminsService.findByEmail(email)
    console.log('admin', admin)
    if (!admin) {
      throw new NotFoundException('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { sub: admin._id, userId: admin._id, email: admin.email, role: admin.role };
    const accessToken = this.jwtService.sign(payload);
    const user = { id: admin._id, email: admin.email, username: admin.username, role: admin.role }
    console.log('user', user)
    console.log('accessToken', accessToken)
    return { accessToken, user }

  }
  async signUp(createUserDto: CreateUserDto) {
    console.log('dto', createUserDto)
    const existingUser = await this.usersService.findByemail(createUserDto.email)
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      console.log('hashed', hashedPassword)

      // Auto-generate required fields for DummyJSON compatibility
      const username = createUserDto.email.split('@')[0];
      const id = Math.floor(Math.random() * 1000000); // Random numeric ID

      // Extract only the fields we need, ignoring things like confirmPassword
      const { email, password } = createUserDto;

      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        username,
      });

      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      console.error('Error during signup:', error);
      throw new InternalServerErrorException('Failed to create user.');
    }
  }




  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    if (!loginDto || !loginDto.email || !loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { email, password } = loginDto;

    const user = await this.usersService.findByemail(email)
    console.log('user', user)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('isPasswordValid', isPasswordValid)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials!!');
    }

    const payload = {
      userId: user._id,
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    // const { password: _, ...result } = user;
    console.log('accessToken', accessToken)
    return { accessToken, user };
  }


  async validateUser(userId: string): Promise<Partial<User>> {

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...result } = user;
    return result;
  }
}
