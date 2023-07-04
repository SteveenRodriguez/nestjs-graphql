import { CreateUserInput } from './create-user.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsUUID, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ValidRoles } from '../../auth/enums/valid-roles.enum';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  @IsOptional()
  roles?: ValidRoles[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
