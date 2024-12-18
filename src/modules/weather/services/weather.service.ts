import axios from 'axios';
import querystring from 'querystring';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CityWeatherResponse } from '../weather.interfaces';
import { CityWeatherDto } from '../dto/get-city-weather.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly configService: ConfigService) {}

  private async fetchCityWeather(city: string): Promise<CityWeatherResponse> {
    const baseUrl = this.configService.get<string>('OPEN_WEATHER_API_URL')!;
    const queryParams = querystring.stringify({
      q: city,
      appid: this.configService.get<string>('OPEN_WEATHER_API_KEY')!,
    });

    try {
      const { data } = await axios.post(`${baseUrl}?${queryParams}`);
      return data as CityWeatherResponse;
    } catch (error) {
      const statusCode = error.response?.status ?? HttpStatus.BAD_REQUEST;
      const errorMessage = error.response?.data?.message ?? error.message;

      this.logger.error(
        `Failed to fetch the current weather of city ${city}, reason: ${errorMessage}`,
      );

      if (error.response) {
        throw new HttpException(errorMessage, statusCode);
      }

      throw new BadRequestException('Something went wrong!');
    }
  }

  async getCityCurrentWeather(
    cityWeatherDto: CityWeatherDto,
  ): Promise<CityWeatherResponse> {
    const result = await this.fetchCityWeather(cityWeatherDto.city);
    return result;
  }
}
