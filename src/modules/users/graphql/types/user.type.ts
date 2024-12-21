import { ObjectType, Field, Int } from '@nestjs/graphql';

import { LocationType } from './location.type';

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => [LocationType], { nullable: true })
  locations?: LocationType[];
}
