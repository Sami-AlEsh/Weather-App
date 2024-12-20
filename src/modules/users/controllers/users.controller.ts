import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ type: User })
  async getUserById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    return this.usersService.findUserById(userId);
  }

  @Delete('/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.usersService.remove(userId);
  }
}
