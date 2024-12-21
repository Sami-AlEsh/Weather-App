import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class LocationType {
  @Field(() => Int)
  id: number;

  @Field()
  city: string;

  @Field()
  country: string;

  @Field(() => Float, { nullable: true })
  latitude: number;

  @Field(() => Float, { nullable: true })
  longitude: number;
}
