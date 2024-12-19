import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { POSTGRES_ERROR_CODES } from 'src/common/enums/postgres-error-codes.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Fetch and validate the user by id
   * @param userId
   * @returns
   */
  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('Invalid user id');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<void> {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      this.logger.log(`User ${user.email} created successfully`);
    } catch (err) {
      if (err.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new ConflictException('Email is already in use');
      }

      this.logger.error(err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async remove(userId: number): Promise<void> {
    const { affected } = await this.userRepository.delete({ id: userId });

    if (!affected) {
      throw new NotFoundException('Unable to delete user, User was not found');
    }

    this.logger.log(`User with id ${userId} deleted successfully`);
  }
}