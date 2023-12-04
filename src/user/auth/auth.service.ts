import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'; // 用来加密密码
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async signup(
    { email, password, name, phone }: SignupParams,
    userType: UserType,
  ) {
    const userExits = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExits) {
      throw new ConflictException('Email already exists');
    }

    const hashPassowrd = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashPassowrd,
        user_type: userType,
      },
    });

    return await this.generateJWT(user.name, user.id);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 400);
    }

    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Password error', 400);
    }

    return await this.generateJWT(user.name, user.id);
  }
  private async generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: '1d', // 表示一天后过期
      },
    );
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(string, 10);
  }
}
