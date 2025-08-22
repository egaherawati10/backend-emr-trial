import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CAN_KEY, AnyResource } from './can.decorator';
import { CAPABILITIES, Action, Role } from '../auth/capabilities';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { id: number; role: Role } | undefined;
    const meta = this.reflector.get<{ resource: AnyResource; action: Action } | undefined>(
      CAN_KEY,
      ctx.getHandler(),
    );

    if (!user) throw new UnauthorizedException('Missing authenticated user');
    if (!meta) return true; // no policy metadata → allow

    const { resource, action } = meta;

    // Admin always wins
    if (user.role === 'admin') return true;

    // If resource exists in CAPABILITIES matrix, check it.
    const rules = CAPABILITIES[user.role] ?? {};
    const allowedActions = (rules as any)[resource] as Action[] | undefined;

    // If resource not listed in matrix, treat as admin-only
    if (!allowedActions) {
      throw new ForbiddenException('Insufficient capability');
    }

    if (!allowedActions.includes(action)) {
      throw new ForbiddenException('Insufficient capability');
    }
    return true;
  }
}