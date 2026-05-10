import { IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, ValidateNested, IsPostalCode, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';



export class CreateUserDto {


  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;


  @IsString()
  @MinLength(6)
  confirmPassword: string;


}