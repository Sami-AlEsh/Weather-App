import { Module } from '@nestjs/common';

import { WeatherService } from './services/weather.service';
import { ForecastService } from './services/forecast.service';
import { WeatherController } from './controllers/weather.controller';
import { ForecastController } from './controllers/forecast.controller';

@Module({
  controllers: [WeatherController, ForecastController],
  providers: [WeatherService, ForecastService],
})
export class WeatherModule {}
