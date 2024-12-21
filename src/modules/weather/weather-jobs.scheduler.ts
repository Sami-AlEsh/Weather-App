import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UsersLocationsService } from '../users/services/users-locations.service';

@Injectable()
export class WeatherJobsScheduler {
  constructor(
    private readonly usersLocationService: UsersLocationsService,
    @InjectQueue('weather') private readonly weatherQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  // @Cron(CronExpression.EVERY_5_SECONDS)
  async refreshWeatherData(): Promise<void> {
    const cities = await this.usersLocationService.findAllFavoriteCities();
    await this.weatherQueue.add('updateWeatherData', cities);
  }
}
