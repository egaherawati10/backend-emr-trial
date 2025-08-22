import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type AccessPayload = { sub: number; role: string; tv: number; jti: string; typ?: 'access' };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    // Ensure the secret is present and typed as a definite string
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,          // <-- definite string, no more TS error
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessPayload) {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, tokenVersion: true },
    });

    if (!user) throw new UnauthorizedException();
    if (user.status !== 'active') throw new ForbiddenException('Account is not active');
    if (user.tokenVersion !== payload.tv) throw new UnauthorizedException('Session revoked');

    // Attach to req.user
    return { id: user.id, role: user.role, jti: payload.jti };
  }
}