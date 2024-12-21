import GraphQLJSON from 'graphql-type-json';
import { Field, ObjectType } from '@nestjs/graphql';

import { CityWeatherResponseDto } from '../../dto/city-weather-response.dto';

@ObjectType()
export class CityWeatherResponseType implements CityWeatherResponseDto {
  @Field(() => GraphQLJSON)
  coord: any;

  @Field(() => [GraphQLJSON])
  weather: any[];

  @Field(() => String, { nullable: true })
  base: string;

  @Field(() => GraphQLJSON)
  main: any;

  @Field(() => Number)
  visibility: number;

  @Field(() => GraphQLJSON)
  wind: any;

  @Field(() => GraphQLJSON)
  clouds: any;

  @Field(() => Number)
  dt: number;

  @Field(() => GraphQLJSON)
  sys: any;

  @Field(() => Number)
  timezone: number;

  @Field(() => Number)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  cod: number;
}
