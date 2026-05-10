import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CommentUserDto {

  @ApiProperty({ example: 'emmac' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Emma Wilson' })
  @IsString()
  fullName: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'This is some awesome thinking!' })
  @IsString()
  body: string;

  @ApiProperty({ example: 242 })
  @IsNumber()
  postId: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  likes: number;

  @ApiProperty({ type: CommentUserDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CommentUserDto)
  user: CommentUserDto;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}

export class CommentDto {

  @ApiProperty({ example: 'This is some awesome thinking!' })
  body: string;

  @ApiProperty({ example: 242 })
  postId: number;

  @ApiProperty({ example: 3 })
  likes: number;

  @ApiProperty({ type: CommentUserDto })
  user: CommentUserDto;
}
