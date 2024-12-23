import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { envValidationSchema } from 'config/env.schema';
import { UsersModule } from './modules/users/users.module';
import { WeatherModule } from './modules/weather/weather.module';
import { AppLoggerMiddleware } from './common/middlewares/app-logger.middleware';

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
            if (ctx.getType<string>() === 'graphql') {
              return true;
            }

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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        database: config.get<string>('DB_NAME'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        autoLoadEntities: true,
        // TODO: Set it to false and add migration files
        synchronize: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
