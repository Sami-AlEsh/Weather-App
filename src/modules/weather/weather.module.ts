import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { WeatherService } from './services/weather.service';
import { WeatherResolver } from './graphql/weather.resolver';
import { ForecastService } from './services/forecast.service';
import { WeatherController } from './controllers/weather.controller';
import { ForecastController } from './controllers/forecast.controller';
import { BullModule } from '@nestjs/bullmq';
import { WeatherJobsScheduler } from './weather-jobs.scheduler';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherJobProcessor } from './weather-jobs.processor';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
          },
          database: 0,
        }),
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          db: 1,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'weather',
    }),
    UsersModule,
  ],
  controllers: [WeatherController, ForecastController],
  providers: [
    WeatherService,
    ForecastService,
    WeatherJobsScheduler,
    WeatherJobProcessor,
    WeatherResolver,
  ],
})
export class WeatherModule {}
