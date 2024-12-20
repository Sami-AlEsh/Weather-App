import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as User;
  },
);
