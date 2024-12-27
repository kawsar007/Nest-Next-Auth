import { ConflictException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import refreshConfig from './config/refresh.config';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>
  ) { };
  async registerUser(createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.findByEmail(createUserDto.email);
      if (user) throw new ConflictException('User already exists');
      return this.userService.create(createUserDto);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.response?.message || error.message,
        },
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException("User not found!");
    const isPasswordMatched = await verify(user.password, password);
    if (!isPasswordMatched) throw new UnauthorizedException("Invalid Credentials!");

    return { id: user.id, name: user.name };
  }


  async login(userId: number, name?: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    return {
      id: userId,
      name,
      accessToken,
      refreshToken
    }
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ])

    return {
      accessToken,
      refreshToken
    }
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException("User not found!");
    const currentUser = { id: user.id };
    return currentUser;
  }
}


