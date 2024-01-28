import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SavingsModel {
  @Field(() => Float)
  currentPotSize: number;

  @Field(() => Float)
  annualGrowthRate: number;

  @Field(() => Int)
  numberOfYears: number;

  @Field(() => Float)
  regularMonthlyContribution: number;

  @Field(() => Float)
  futureValue: number;
}
