import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // 10位手机号
  @Matches(/^[1-9]\d{9}$/, { message: 'Phone number is invalid' })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional() // 不是必填
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class generateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
