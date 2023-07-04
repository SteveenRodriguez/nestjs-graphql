/* eslint-disable prettier/prettier */
import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import { ValidRoles } from '../../../auth/enums/valid-roles.enum';

@ArgsType() // indica que es un tipo de Args para recibir en el endpoint de graphql
export class ValidRolesArgs {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  roles: ValidRoles[] = [];
}
