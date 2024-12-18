import { ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { CityWeatherResponse } from '../weather.interfaces';
import { WeatherService } from '../services/weather.service';
import { CityDto } from '../dto/city.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve current weather for a given city' })
  async getCityCurrentWeather(
    @Param() cityWeatherDto: CityDto,
  ): Promise<CityWeatherResponse> {
    return this.weatherService.getCityCurrentWeather(cityWeatherDto);
  }
}