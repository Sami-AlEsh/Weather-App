import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let req: any;
    if (ctx.getType<string>() === 'graphql') {
      const gqlContext = ctx.getArgByIndex(2);
      req = gqlContext.req;
    } else {
      req = ctx.switchToHttp().getRequest();
    }

    return req.user as User;
  },
);
