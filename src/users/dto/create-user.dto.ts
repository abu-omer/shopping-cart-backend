import { IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, ValidateNested, IsPostalCode, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from "@nestjs/mapped-types";

import { Type } from 'class-transformer';




export class CreateAddressDto {
  @IsString()
  street?: string;

  @IsString()
  city?: string;

  @IsString()
  state?: string;

  @IsString()
  @IsPostalCode('any')
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) { }

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @MaxLength(50)
  lastName?: string;
}