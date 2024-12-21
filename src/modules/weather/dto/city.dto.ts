import { Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({
    description: 'The city for which to retrieve weather information',
    example: 'London',
  })
  @Transform(({ value }) => value.toLowerCase().trim())
  @Matches(/^[a-zA-Z][a-zA-Z\s]+[a-zA-Z]$/, {
    message:
      'City name can only contain letters and spaces and must start and end with a letter.',
  })
  city: string;
}
