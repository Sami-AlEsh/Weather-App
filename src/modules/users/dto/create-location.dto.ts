import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from 'class-validator';

import { Location } from '../entities/location.entity';

export class CreateLocationDto implements Omit<Location, 'id' | 'user'> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
