import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Matches,
} from 'class-validator';
import { CreateLocationDto } from '../../dto/create-location.dto';

@InputType()
export class CreateLocationInput implements CreateLocationDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z][a-zA-Z\s]+[a-zA-Z]$/, {
    message:
      'City name can only contain letters and spaces and must start and end with a letter.',
  })
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  country: string;

  @Field(() => Float, { nullable: true })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}
