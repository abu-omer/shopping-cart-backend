import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Admin, AdminDocument } from 'src/admins/entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in .env file');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<any> {
    const userId = payload.userId || payload.sub;

    if (!userId) {
      throw new UnauthorizedException('Invalid JWT payload: missing user ID');
    }

    // Try finding in User collection
    let user: any = await this.userModel.findById(userId).exec();

    // If not found, try finding in Admin collection
    if (!user) {
      user = await this.adminModel.findById(userId).exec();
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
