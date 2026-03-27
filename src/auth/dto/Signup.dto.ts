import { IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, ValidateNested, IsPostalCode, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';




// export class AddressDto {
//   @IsString()
//   @IsNotEmpty()
//   street: string;

//   @IsString()
//   @IsNotEmpty()
//   city: string;

//   @IsString()
//   @IsNotEmpty()
//   state: string;

//   @IsString()
//   @IsNotEmpty()
//   @IsPostalCode('any')
//   zipCode: string;

//   @IsOptional()
//   @IsString()
//   country: string;
// }


export class CreateUserDto {


  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;


  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;


}