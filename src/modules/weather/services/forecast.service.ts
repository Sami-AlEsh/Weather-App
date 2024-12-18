import axios from 'axios';
import querystring from 'querystring';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CityDto } from '../dto/city.dto';
import { CityForecastResponse } from '../forecast.interfaces';

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(private readonly configService: ConfigService) {}

  private async fetchCityForecast(city: string): Promise<CityForecastResponse> {
    const baseUrl = this.configService.get<string>(
      'OPEN_CITY_FORECAST_API_URL',
    )!;
    const queryParams = querystring.stringify({
      q: city,
      appid: this.configService.get<string>('OPEN_WEATHER_API_KEY')!,
    });

    try {
      const { data } = await axios.post(`${baseUrl}?${queryParams}`);
      return data as CityForecastResponse;
    } catch (error) {
      const statusCode = error.response?.status ?? HttpStatus.BAD_REQUEST;
      const errorMessage = error.response?.data?.message ?? error.message;

      this.logger.error(
        `Failed to fetch the forecast of city ${city}, reason: ${errorMessage}`,
      );

      if (error.response) {
        throw new HttpException(errorMessage, statusCode);
      }

      throw new BadRequestException('Something went wrong!');
    }
  }

  async getCityForecast(
    cityWeatherDto: CityDto,
  ): Promise<CityForecastResponse> {
    const result = await this.fetchCityForecast(cityWeatherDto.city);
    return result;
  }
}
