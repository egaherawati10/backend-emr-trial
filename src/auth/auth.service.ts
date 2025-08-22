import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

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

  private accessTtl() {
    return process.env.JWT_ACCESS_TTL || '15m';
  }
  private accessSecret() {
    const s = process.env.JWT_ACCESS_SECRET;
    if (!s) throw new Error('JWT_ACCESS_SECRET not set');
    return s;
  }

  /** Sign an access token embedding tokenVersion and a fresh jti */
  private async signAccessToken(userId: number) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, tokenVersion: true, status: true },
    });
    if (!u) throw new NotFoundException('User not found');
    if (u.status !== 'active') throw new ForbiddenException('Account is not active');

    const payload = {
      sub: u.id,
      role: u.role,
      tv: u.tokenVersion,         // tokenVersion for global revoke
      jti: crypto.randomUUID(),   // per-token id (optional: can be denylisted)
      typ: 'access' as const,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret(),
      expiresIn: this.accessTtl(),
    });
    return access_token;
  }

  /** Create a new user; default status=active. */
  async register(data: RegisterDto) {
    const username = data.username.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();

    // Hash password
    const hash = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          username,
          email,
          password: hash,
          role: (data as any).role ?? ('patient' as UserRole),
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { message: 'Registration successful', user };
    } catch (e) {
      // Handle unique violations gracefully
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }
      throw e;
    }
  }

  /**
   * Used by LocalStrategy. Accepts either username or email (common UX).
   * Return "null" to let the local guard respond with 401.
   */
  async validateUser(usernameOrEmail: string, password: string): Promise<SafeUser | null> {
    const key = usernameOrEmail.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: key }, { email: key }] },
    });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    if (user.status !== 'active') {
      // local strategy expects exceptions to bubble as 401
      throw new UnauthorizedException('Account is suspended');
    }

    const { password: _pw, ...safe } = user as any;
    return safe as SafeUser;
  }

  /** Called by AuthController after Local guard sets req.user */
  async login(user: SafeUser) {
    // Re-load tokenVersion & sign using secrets/ttl
    const access_token = await this.signAccessToken(user.id);
    return { access_token };
  }

  /**
   * Access-only setup: nothing to do server-side for single-session logout.
   * Keep this for API symmetry; implement "logout all" elsewhere by bumping tokenVersion.
   */
  async logout(_userId: number) {
    return { message: 'Logged out successfully' };
  }

  /** Simple profile lookup */
  async profile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}