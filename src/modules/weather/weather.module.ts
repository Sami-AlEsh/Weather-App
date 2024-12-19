import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { WeatherService } from './services/weather.service';
import { ForecastService } from './services/forecast.service';
import { WeatherController } from './controllers/weather.controller';
import { ForecastController } from './controllers/forecast.controller';

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
          ttl: 3600000, // 1h
        }),
      }),
    }),
  ],
  controllers: [WeatherController, ForecastController],
  providers: [WeatherService, ForecastService],
})
export class WeatherModule {}
