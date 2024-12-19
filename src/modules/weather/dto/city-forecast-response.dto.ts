import { ApiProperty } from '@nestjs/swagger';

export class CityForecastResponseDto {
  @ApiProperty()
  cod: string;

  @ApiProperty()
  message: number;

  @ApiProperty()
  cnt: number;

  @ApiProperty()
  list: any[];

  @ApiProperty()
  city: any;
}
