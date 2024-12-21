import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { Location } from '../entities/location.entity';
import { CreateLocationDto } from '../dto/create-location.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersLocationsService {
  private readonly logger = new Logger(UsersLocationsService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    private readonly userServices: UsersService,
  ) {}

  private async checkLocationExist(
    userId: number,
    createLocationDto: CreateLocationDto,
  ): Promise<boolean> {
    const { city, country, latitude, longitude } = createLocationDto;

    const matchedLocation = await this.locationsRepository.findOne({
      where: {
        city,
        country,
        latitude,
        longitude,
        user: { id: userId },
      },
    });

    return !!matchedLocation;
  }

  async addFavoriteLocation(
    user: User,
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    // Check for location duplication
    const isLocationExist = await this.checkLocationExist(
      user.id,
      createLocationDto,
    );

    if (isLocationExist) {
      throw new ConflictException('Location is already added as a favorite!');
    }

    // Otherwise, add location as favorite
    const location = this.locationsRepository.create({
      ...createLocationDto,
      user: { id: user.id },
    });

    const result = await this.locationsRepository.save(location);

    this.logger.log(`New location is added for user with id ${user.id}`);

    return result;
  }

  async getFavoriteLocations(user: User): Promise<Location[]> {
    return await this.locationsRepository.findBy({ user: { id: user.id } });
  }

  async removeFavoriteLocation(
    userId: number,
    locationId: number,
  ): Promise<void> {
    const { affected } = await this.locationsRepository.delete({
      id: locationId,
      user: { id: userId },
    });

    if (!affected) {
      throw new NotFoundException('Location was not found for this user');
    }

    this.logger.log(
      `Location with id ${locationId} deleted successfully for user with id ${userId}`,
    );
  }

  async findAllFavoriteCities(): Promise<string[]> {
    const locations = await this.locationsRepository
      .createQueryBuilder('location')
      .select('location.city', 'city')
      .groupBy('location.city')
      .getRawMany<Location>();

    return locations.map((loc) => loc.city);
  }
}
