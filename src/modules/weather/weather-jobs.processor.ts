import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { WeatherService } from './services/weather.service';
import { ForecastService } from './services/forecast.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Processor('weather')
export class WeatherJobProcessor extends WorkerHost {
  private readonly logger = new Logger(WeatherJobProcessor.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly weatherService: WeatherService,
    private readonly forecastService: ForecastService,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(job: Job, token?: string): Promise<any> {
    this.logger.log(`⛅️ Processing weather job /${job.name}/ ...`);

    const cities: string[] = job.data;
    for (const city of cities) {
      try {
        const forecastKey = this.forecastService.getCityCacheKey(city);
        const weatherKey = this.weatherService.getCityCacheKey(city);

        const [cachedForecast, cachedWeather] = await Promise.all([
          this.cacheManager.get(forecastKey),
          this.cacheManager.get(weatherKey),
        ]);

        const fetchPromises: Promise<any>[] = [];

        if (!cachedForecast) {
          fetchPromises.push(this.forecastService.getCityForecast({ city }));
        }

        if (!cachedWeather) {
          fetchPromises.push(
            this.weatherService.getCityCurrentWeather({ city }),
          );
        }

        // Fetch the data so it got cached automatically
        await Promise.all(fetchPromises);
      } catch (error) {
        this.logger.error(`Error processing city ${city}: ${error.message}`);
      }
    }
  }
}
