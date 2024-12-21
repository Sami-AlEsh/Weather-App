import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { CityDto } from '../dto/city.dto';
import { ForecastService } from '../services/forecast.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CityForecastResponseDto } from '../dto/city-forecast-response.dto';

@Public()
@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('/:city')
  @ApiOperation({ summary: 'Retrieve a 5-day forecast for a given city' })
  @ApiResponse({ type: CityForecastResponseDto })
  getCityForecast(@Param() cityDto: CityDto): Promise<CityForecastResponseDto> {
    return this.forecastService.getCityForecast(cityDto);
  }
}
