import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post('signup')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto)
  }

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  login(@Request() req) {
    return this.authService.login(req.user?.id, req.user?.name);
  };

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@Request() req) {
    return { message: `Now you can access this protected API. This is your user ID: ${req.user?.id}` };
  };
}

