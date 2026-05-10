import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: '123 Nile St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Khartoum' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Khartoum State' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '11111', required: false })
  @IsString()
  @IsOptional()
  stateCode?: string;

  @ApiProperty({ example: '11111', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'Sudan' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ enum: ['cash_on_delivery', 'card', 'wallet'], example: 'cash_on_delivery' })
  @IsEnum(['cash_on_delivery', 'card', 'wallet'])
  paymentMethod: 'cash_on_delivery' | 'card' | 'wallet';

  @ApiProperty({ required: false, example: 'Leave at the door' })
  @IsString()
  @IsOptional()
  shippingInstructions?: string;
}
