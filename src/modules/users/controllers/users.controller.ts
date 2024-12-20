import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({ type: User })
  async getUserById(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user' })
  async deleteUser(@GetUser() user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }
}
