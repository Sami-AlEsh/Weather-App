import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Matches,
} from 'class-validator';

import { Location } from '../entities/location.entity';

export class CreateLocationDto implements Omit<Location, 'id' | 'user'> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z][a-zA-Z\s]+[a-zA-Z]$/, {
    message:
      'City name can only contain letters and spaces and must start and end with a letter.',
  })
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional()
  @IsLatitude()
  @IsOptional()
  latitude: number;

  @ApiPropertyOptional()
  @IsLongitude()
  @IsOptional()
  longitude: number;
}
