import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsOptional, ValidateNested } from "class-validator";
import { CreateUserDto, UpdateAddressDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  shippingAddresses?: UpdateAddressDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  favoriteProducts?: string[];
}