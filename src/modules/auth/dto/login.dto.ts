import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';

export class LogInDto implements Pick<User, 'email' | 'password'> {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(20)
  password: string;
}
