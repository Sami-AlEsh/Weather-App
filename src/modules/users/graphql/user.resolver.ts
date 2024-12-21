import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';

import { UserType } from './types/user.type';
import { User } from '../entities/user.entity';
import { LocationType } from './types/location.type';
import { Location } from '../entities/location.entity';
import { UsersService } from '../services/users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UsersLocationsService } from '../services/users-locations.service';
import { CreateLocationInput } from './inputs/create-location.input';

@Public()
@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersLocationsService: UsersLocationsService,
  ) {}

  @Query(() => UserType)
  async getUserById(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<User> {
    return await this.usersService.findUserById(userId);
  }

  @Query(() => [LocationType])
  async getFavoriteLocations(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Location[]> {
    const user = await this.usersService.findUserById(userId);
    return await this.usersLocationsService.getFavoriteLocations(user);
  }

  @Mutation(() => LocationType)
  async addFavoriteLocation(
    @Context() context: any,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ): Promise<Location> {
    const user = context.user;
    return await this.usersLocationsService.addFavoriteLocation(
      user,
      createLocationInput,
    );
  }

  @Mutation(() => Boolean)
  async removeFavoriteLocation(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('locationId', { type: () => Int }) locationId: number,
  ): Promise<boolean> {
    try {
      await this.usersLocationsService.removeFavoriteLocation(
        userId,
        locationId,
      );
      return true;
    } catch {
      return false;
    }
  }
}
