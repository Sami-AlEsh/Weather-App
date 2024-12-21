import axios from 'axios';
import querystring from 'querystring';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CityDto } from '../dto/city.dto';
import { CityWeatherResponseDto } from '../dto/city-weather-response.dto';

@Injectable()
export class WeatherService {
  private readonly WEATHER_CACHE_TTL = 3600000; // 1h
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  getCityCacheKey(city: string): string {
    return `city:weather:${city}`;
  }

  private async getCachedWeather(
    city: string,
  ): Promise<CityWeatherResponseDto | null> {
    const key = this.getCityCacheKey(city);
    const cachedData = await this.cacheManager.get<CityWeatherResponseDto>(key);
    return cachedData || null;
  }

  private async cacheWeatherData(
    city: string,
    result: CityWeatherResponseDto,
  ): Promise<void> {
    const key = this.getCityCacheKey(city);
    await this.cacheManager.set(key, result, this.WEATHER_CACHE_TTL);
  }

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

      throw new BadRequestException('Something went wrong!');
    }
  }

  /**
   * Get the weather of a city, and cache the result for next time
   * @param cityDto
   * @returns
   */
  async getCityCurrentWeather(
    cityDto: CityDto,
  ): Promise<CityWeatherResponseDto> {
    let { city } = cityDto;
    city = city.toLowerCase().trim();

    // Check if result is cached
    const cachedResult = await this.getCachedWeather(city);
    if (cachedResult) return cachedResult;

    // Fetch data and update the cache
    const result = await this.fetchCityWeather(city);
    this.cacheWeatherData(city, result);
    return result;
  }
}
