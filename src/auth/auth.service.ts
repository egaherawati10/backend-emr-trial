import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Username or email already exists');

    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hash,
        role: data.role,
        status: 'active', // optional, Prisma default is active
      },
      select: {
        id: true, name: true, username: true, email: true, role: true, status: true,
        createdAt: true, updatedAt: true,
      },
    });

    return { message: 'Registration successful', user };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  // For simple JWT-only sessions, logout is a no-op unless you implement blacklisting
  async logout() {
    return { message: 'Logged out successfully' };
  }

  async profile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, username: true, email: true, role: true, status: true,
        createdAt: true, updatedAt: true,
      },
    });
  }
}