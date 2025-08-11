import { Controller, Get, Post, Body, UseGuards, UnauthorizedException, InternalServerErrorException, ConflictException, BadRequestException, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException('Email or username already exists');
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User }) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      return this.authService.login(req.user);
    } catch (error) {
      throw new InternalServerErrorException('Login failed');
    }
  }
}
