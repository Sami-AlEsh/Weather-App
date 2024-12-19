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

@ApiTags('User Favorite Locations')
@Controller('users/:userId/locations')
export class UsersLocationsController {
  constructor(private readonly usersLocationsService: UsersLocationsService) {}

  @Get()
  @ApiOperation({ summary: "Retrieve the user's favorite locations" })
  @ApiResponse({ type: Location, isArray: true })
  async findAllFavoriteLocations(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Location[]> {
    return this.usersLocationsService.getFavoriteLocations(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a favorite location for the user' })
  @ApiResponse({ type: Location })
  addFavoriteLocation(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.usersLocationsService.addFavoriteLocation(
      userId,
      createLocationDto,
    );
  }

  @Delete('/:locationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user favorite location' })
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('locationId', ParseIntPipe) locationId: number,
  ): Promise<void> {
    await this.usersLocationsService.removeFavoriteLocation(userId, locationId);
  }
}
