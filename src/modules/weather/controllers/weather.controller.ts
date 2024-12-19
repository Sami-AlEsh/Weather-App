import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { CityDto } from '../dto/city.dto';
import { WeatherService } from '../services/weather.service';
import { CityWeatherResponseDto } from '../dto/city-weather-response.dto';

@Controller('weather')
@UseInterceptors(CacheInterceptor)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve current weather for a given city' })
  @ApiResponse({ type: CityWeatherResponseDto })
  async getCityCurrentWeather(
    @Param() cityDto: CityDto,
  ): Promise<CityWeatherResponseDto> {
    return this.weatherService.getCityCurrentWeather(cityDto);
  }
}
