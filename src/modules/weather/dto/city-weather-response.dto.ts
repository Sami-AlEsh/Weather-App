import { ApiProperty } from '@nestjs/swagger';

export class CityWeatherResponseDto {
  @ApiProperty()
  coord: any;

  @ApiProperty()
  weather: any[];

  @ApiProperty()
  base: string;

  @ApiProperty()
  main: any;

  @ApiProperty()
  visibility: number;

  @ApiProperty()
  wind: any;

  @ApiProperty()
  clouds: any;

  @ApiProperty()
  dt: number;

  @ApiProperty()
  sys: any;

  @ApiProperty()
  timezone: number;

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cod: number;
}
