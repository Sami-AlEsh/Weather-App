import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Location {
  @ApiProperty({ description: 'Location id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'City name' })
  @Column()
  city: string;

  @ApiProperty({ description: 'Country name' })
  @Column()
  country: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    nullable: true,
    default: null,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    default: null,
  })
  latitude: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    nullable: true,
    default: null,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    default: null,
  })
  longitude: number;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
  user: User;
}
