import { IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, ValidateNested, IsPostalCode, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from "@nestjs/mapped-types";

import { Type } from 'class-transformer';




class CoordinatesDto {
  @IsNumber()
  @IsOptional()
  lat: number;

  @IsNumber()
  @IsOptional()
  lng: number;
}

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  stateCode?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) { }

class HairDto {
  @IsString()
  @IsOptional()
  color: string;

  @IsString()
  @IsOptional()
  type: string;
}

class BankDto {
  @IsString()
  @IsOptional()
  cardExpire: string;

  @IsString()
  @IsOptional()
  cardNumber: string;

  @IsString()
  @IsOptional()
  cardType: string;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  iban: string;
}

class CompanyDto {
  @IsString()
  @IsOptional()
  department: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}

class CryptoDto {
  @IsString()
  @IsOptional()
  coin: string;

  @IsString()
  @IsOptional()
  wallet: string;

  @IsString()
  @IsOptional()
  network: string;
}

export class CreateUserDto {
  // @IsNumber()
  // @IsOptional()
  // id?: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  maidenName?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  eyeColor?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HairDto)
  hair?: HairDto;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  @IsString()
  @IsOptional()
  macAddress?: string;

  @IsString()
  @IsOptional()
  university?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankDto)
  bank?: BankDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDto)
  company?: CompanyDto;

  @IsString()
  @IsOptional()
  ein?: string;

  @IsString()
  @IsOptional()
  ssn?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CryptoDto)
  crypto?: CryptoDto;

  @IsOptional()
  @IsEnum(['admin', 'moderator', 'user', 'customer'])
  role: string;
}