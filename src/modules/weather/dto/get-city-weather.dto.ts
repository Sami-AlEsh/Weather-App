import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CityWeatherDto {
  @ApiProperty({
    description: 'The city for which to retrieve weather information',
    example: 'London',
  })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'City name can only contain letters and spaces',
  })
  city: string;
}
