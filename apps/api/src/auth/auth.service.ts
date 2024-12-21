import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { };
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
}


