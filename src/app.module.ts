import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from 'config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('REQUESTS_TTL')! * 1000,
          limit: config.get<number>('REQUESTS_LIMIT')!,
          skipIf: (ctx) => {
            const headers = ctx.switchToHttp().getRequest().headers;
            const origin = headers.origin || headers.referer;
            const originsToSkip = config
              .get<string>('THROTTLING_SKIP_ORIGINS')!
              .split(',');
            return originsToSkip.includes(origin);
          },
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
