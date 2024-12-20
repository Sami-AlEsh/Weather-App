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

import { CityDto } from '../dto/city.dto';
import { CityWeatherResponseDto } from '../dto/city-weather-response.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly configService: ConfigService) {}

  private async fetchCityWeather(
    city: string,
  ): Promise<CityWeatherResponseDto> {
    const baseUrl = this.configService.get<string>(
      'OPEN_CITY_WEATHER_API_URL',
    )!;
    const queryParams = querystring.stringify({
      q: city,
      appid: this.configService.get<string>('OPEN_WEATHER_API_KEY')!,
    });

    try {
      const { data } = await axios.post(`${baseUrl}?${queryParams}`);
      return data as CityWeatherResponseDto;
    } catch (error) {
      const statusCode = error.response?.status ?? HttpStatus.BAD_REQUEST;
      const errorMessage = error.response?.data?.message ?? error.message;

      if (error.response) {
        throw new HttpException(errorMessage, statusCode);
      }

      this.logger.error(
        `Failed to fetch the current weather of city ${city}, reason: ${errorMessage}`,
      );

      throw new BadRequestException('Something went wrong!');
    }
  }

  async getCityCurrentWeather(
    cityDto: CityDto,
  ): Promise<CityWeatherResponseDto> {
    const result = await this.fetchCityWeather(cityDto.city);
    return result;
  }
}
