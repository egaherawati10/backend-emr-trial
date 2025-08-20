import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole, UserStatus } from '@prisma/client';

type SafeUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Username or email already exists');

    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: { ...data, password: hash, status: 'active' },
      select: { id: true, name: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    return { message: 'Registration successful', user };
  }

  /** Used by LocalStrategy */
  async validateUser(username: string, password: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended');
    }

    const { password: _pw, ...safe } = user;
    return safe as SafeUser;
  }

  /** Called by AuthController after Local guard sets req.user */
  async login(user: SafeUser) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  async logout(userId: number) {
    // Implement refresh-token revocation if you use refresh tokens
    return { message: 'Logged out successfully' };
  }

  async profile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
  }
}