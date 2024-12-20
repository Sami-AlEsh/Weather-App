import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { Location } from '../entities/location.entity';
import { UsersLocationsService } from '../services/users-locations.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { User } from '../entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('User Favorite Locations')
@Controller('users/locations')
export class UsersLocationsController {
  constructor(private readonly usersLocationsService: UsersLocationsService) {}

  @Get()
  @ApiOperation({ summary: "Retrieve the user's favorite locations" })
  @ApiResponse({ type: Location, isArray: true })
  async findAllFavoriteLocations(@GetUser() user: User): Promise<Location[]> {
    return this.usersLocationsService.getFavoriteLocations(user);
  }

  @Post()
  @ApiOperation({ summary: 'Add a favorite location for the user' })
  @ApiResponse({ type: Location })
  addFavoriteLocation(
    @GetUser() user: User,
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.usersLocationsService.addFavoriteLocation(
      user,
      createLocationDto,
    );
  }

  @Delete('/:locationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user favorite location' })
  async deleteUser(
    @GetUser() user: User,
    @Param('locationId', ParseIntPipe) locationId: number,
  ): Promise<void> {
    await this.usersLocationsService.removeFavoriteLocation(
      user.id,
      locationId,
    );
  }
}
