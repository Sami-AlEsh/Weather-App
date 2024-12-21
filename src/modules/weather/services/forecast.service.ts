import axios from 'axios';
import querystring from 'querystring';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import { CityDto } from '../dto/city.dto';
import { CityForecastResponseDto } from '../dto/city-forecast-response.dto';

@Injectable()
export class ForecastService {
  private readonly FORECAST_CACHE_TTL = 3600000; // 1h
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  private getCityCacheKey(city: string): string {
    return `city:forecast:${city}`;
  }

  private async getCachedForecast(
    city: string,
  ): Promise<CityForecastResponseDto | null> {
    const key = this.getCityCacheKey(city);
    const cachedData =
      await this.cacheManager.get<CityForecastResponseDto>(key);
    return cachedData || null;
  }

  private async cacheForecastData(
    city: string,
    result: CityForecastResponseDto,
  ): Promise<void> {
    const key = this.getCityCacheKey(city);
    await this.cacheManager.set(key, result, this.FORECAST_CACHE_TTL);
  }

  private async fetchCityForecast(
    city: string,
  ): Promise<CityForecastResponseDto> {
    const baseUrl = this.configService.get<string>(
      'OPEN_CITY_FORECAST_API_URL',
    )!;
    const queryParams = querystring.stringify({
      q: city,
      appid: this.configService.get<string>('OPEN_WEATHER_API_KEY')!,
    });

    try {
      const { data } = await axios.post(`${baseUrl}?${queryParams}`);
      return data as CityForecastResponseDto;
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

  async getCityForecast(cityDto: CityDto): Promise<CityForecastResponseDto> {
    const { city } = cityDto;

    // Check if result is cached
    const cachedResult = await this.getCachedForecast(city);
    if (cachedResult) return cachedResult;

    // Fetch data and update the cache
    const result = await this.fetchCityForecast(city);
    this.cacheForecastData(city, result);
    return result;
  }
}
