import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEmail, IsString } from 'class-validator';
import { Item } from '../../items/entities/item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { List } from '../../list/entities/list.entity';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @IsString()
  fullName: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  // @Field(() => String) cuando se desactiva no se muestra en GraphQL
  @Column()
  @IsString()
  password: string;

  @Field(() => [String])
  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  @IsArray()
  roles: string[];

  @Field(() => String)
  @Column({
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  isActive: boolean;

  // TODO: relaciones
  //Relacion con entidad User
  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  @JoinColumn({ name: 'lastUpdateBy' })
  @Field(() => User, { nullable: true })
  lastUpdateBy?: User;

  //Relacion con entidad Item
  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  // @Field(() => [Item])
  items: Item[];

  //Relacion con entidad List
  @OneToMany(() => List, (list) => list.user)
  // @Field(() => [Item])
  lists: List[];
}
