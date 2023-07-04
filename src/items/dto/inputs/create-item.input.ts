import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  // @Field(() => Float)
  // @IsPositive()
  // @Min(1)
  // quantity: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
