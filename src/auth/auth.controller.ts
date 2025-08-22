// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/common/auth/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({ description: 'Registration successful' })
  @ApiConflictResponse({ description: 'Username or email already exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @ApiOkResponse({ description: 'Returns access token' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or suspended account' })
  login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  // Protected by APP_GUARD (JwtAuthGuard first, then PolicyGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logged out (access-only setup; no server-side state)' })
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  // Protected by APP_GUARD
  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current user profile' })
  profile(@Req() req: any) {
    return this.authService.profile(req.user.id);
  }
}