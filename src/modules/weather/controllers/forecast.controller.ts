import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { CityDto } from '../dto/city.dto';
import { ForecastService } from '../services/forecast.service';
import { CityForecastResponseDto } from '../dto/city-forecast-response.dto';

@Controller('forecast')
@UseInterceptors(CacheInterceptor)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve a 5-day forecast for a given city' })
  @ApiResponse({ type: CityForecastResponseDto })
  getCityForecast(@Param() cityDto: CityDto): Promise<CityForecastResponseDto> {
    return this.forecastService.getCityForecast(cityDto);
  }
}
