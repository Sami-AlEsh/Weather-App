import { Resolver, Query, Args } from '@nestjs/graphql';

import { WeatherService } from '../services/weather.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CityWeatherResponseType } from './types/city-weather-response.type';

@Resolver()
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Query(() => CityWeatherResponseType)
  async currentCityWeather(
    @Args('city') city: string,
  ): Promise<CityWeatherResponseType> {
    const data = await this.weatherService.getCityCurrentWeather({ city });
    return data;
  }
}
