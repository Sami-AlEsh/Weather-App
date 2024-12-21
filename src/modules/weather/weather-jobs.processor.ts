import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { WeatherService } from './services/weather.service';
import { ForecastService } from './services/forecast.service';

@Processor('weather')
export class WeatherJobProcessor extends WorkerHost {
  private readonly logger = new Logger(WeatherJobProcessor.name);

  constructor(
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
      // Fetch the data so it got cached automatically
      await Promise.all([
        this.weatherService.getCityCurrentWeather({ city }),
        this.forecastService.getCityForecast({ city }),
      ]);
    }
  }
}
