import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { AdminsService } from 'src/admins/admins.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { UserDocument } from 'src/users/entities/user.entity';
import { CreateUserDto } from './dto/Signup.dto';
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
    const { email, password } = loginDto

    const admin = await this.adminsService.findByAdminname(email)
    if (!admin) {
      throw new NotFoundException('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { sub: admin._id, email: admin.email }

    return { access_token: this.jwtService.sign(payload), user: { id: admin._id, email: admin.email, username: admin.username } }

  }
  async signUp(createUserDto: CreateUserDto) {
    console.log('dto', createUserDto)
    const existingUser = await this.usersService.findByemail(createUserDto.email)
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    try {

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
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
    const { email, password } = loginDto;

    const user = await this.usersService.findByemail(email)
    console.log('user', user)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // const { password: _, ...result } = user;
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
