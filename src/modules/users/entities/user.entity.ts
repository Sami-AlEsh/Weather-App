import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Location } from './location.entity';

@Entity()
export class User {
  @ApiProperty({ description: 'User id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiHideProperty()
  @OneToMany(() => Location, (location) => location.user)
  locations: Location[];
}
