import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

import { UserType } from './types/user.type';
import { User } from '../entities/user.entity';
import { LocationType } from './types/location.type';
import { Location } from '../entities/location.entity';
import { UsersService } from '../services/users.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateLocationInput } from './inputs/create-location.input';
import { UsersLocationsService } from '../services/users-locations.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersLocationsService: UsersLocationsService,
  ) {}

  @Query(() => UserType)
  async getMyUser(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => [LocationType])
  async getFavoriteLocations(@GetUser() user: User): Promise<Location[]> {
    return await this.usersLocationsService.getFavoriteLocations(user);
  }

  @Mutation(() => LocationType)
  async addFavoriteLocation(
    @GetUser() user: User,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ): Promise<Location> {
    return await this.usersLocationsService.addFavoriteLocation(
      user,
      createLocationInput,
    );
  }

  @Mutation(() => Boolean)
  async removeFavoriteLocation(
    @GetUser() user: User,
    @Args('locationId', { type: () => Int }) locationId: number,
  ): Promise<boolean> {
    try {
      await this.usersLocationsService.removeFavoriteLocation(
        user.id,
        locationId,
      );
      return true;
    } catch {
      return false;
    }
  }
}
