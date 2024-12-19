import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { ForecastService } from '../services/forecast.service';
import { CityDto } from '../dto/city.dto';
import { CityForecastResponse } from '../weather.interfaces';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve a 5-day forecast for a given city' })
  @ApiResponse({ type: CityForecastResponse })
  getCityForecast(@Param() cityDto: CityDto): Promise<CityForecastResponse> {
    return this.forecastService.getCityForecast(cityDto);
  }
}
