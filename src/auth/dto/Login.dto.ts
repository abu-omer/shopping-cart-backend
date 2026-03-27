import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class LoginDto {

  @IsNotEmpty()
  email: string;



  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
