import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtStrategy: JwtStrategy,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: Request;
    if (context.getType<string>() === 'graphql') {
      const gqlContext = context.getArgByIndex(2);
      request = gqlContext.req as Request;
    } else {
      request = context.switchToHttp().getRequest<Request>();
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public routes
    if (isPublic) {
      return true;
    }
    // JWT token guarded routes
    else {
      const token = this.extractTokenFromRequest(request);
      if (!token) throw new UnauthorizedException();

      const user = await this.jwtStrategy.validate(token);
      request['user'] = user;
      return true;
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
