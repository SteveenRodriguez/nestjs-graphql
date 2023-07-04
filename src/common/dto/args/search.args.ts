/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
