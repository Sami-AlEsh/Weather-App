import { ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { ForecastService } from '../services/forecast.service';
import { CityDto } from '../dto/city.dto';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve a 5-day forecast for a given city' })
  getCityForecast(@Param() cityWeatherDto: CityDto) {
    return this.forecastService.getCityForecast(cityWeatherDto);
  }
}
