import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Location } from './entities/location.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersLocationsController } from './controllers/users-locations.controller';
import { UsersLocationsService } from './services/users-locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Location])],
  controllers: [UsersController, UsersLocationsController],
  providers: [UsersService, UsersLocationsService],
  exports: [UsersService],
})
export class UsersModule {}
