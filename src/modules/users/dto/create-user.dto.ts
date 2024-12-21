import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../entities/user.entity';

export class CreateUserDto implements Omit<User, 'id' | 'locations'> {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(50)
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(20)
  password: string;
}
