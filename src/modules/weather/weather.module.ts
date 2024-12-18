import { Module } from '@nestjs/common';

import { WeatherService } from './services/weather.service';
import { WeatherController } from './controllers/weather.controller';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
