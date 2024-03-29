import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, Max, Min } from 'class-validator';

@InputType()
export class CommonSavingsInput {
  // C: Current Pot Size
  @Field(() => Float)
  @IsNotEmpty()
  @Min(0, { message: 'Current Pot Size must be greater than or equal to 0' })
  @Max(10000000, {
    message: 'Current Pot Size must be less than or equal to 10000000',
  })
  currentPotSize: number;

  // i: Annual growth rate, taken as unit value here (eg 5% ==> 0,05).
  @Field(() => Float)
  @IsNotEmpty()
  @Min(0, { message: 'Annual growth rate must be greater than or equal to 0' })
  @Max(1, { message: 'Annual growth rate must be less than or equal to 1' })
  annualGrowthRate: number;

  // t: Number of compounding periods (years)
  @Field(() => Int)
  @IsNotEmpty()
  @Min(1, {
    message:
      'Number of compounding periods (years) must be greater than or equal to 1',
  })
  @Max(70, {
    message:
      'Number of compounding periods (years) must be less than or equal to 70',
  })
  numberOfYears: number;
}

@InputType()
export class CalculateFutureValueInputDto extends CommonSavingsInput {
  // Pmt: Regular savings amount (monthly payment)
  @Field(() => Float)
  @IsNotEmpty()
  @Min(0, {
    message: 'Monthly amount must be greater than or equal to 0',
  })
  @Max(1000000, {
    message: 'Monthly amount must be less than or equal to 1000000',
  })
  regularMonthlyAmount: number;
}

@InputType()
export class TargetMonthlySavingsInputDto extends CommonSavingsInput {
  // FV: Future Value
  @Field(() => Float)
  @IsNotEmpty()
  @Min(0, { message: 'Future Value must be greater than or equal to 0' })
  @Max(100000000, {
    message: 'Future Value must be less than or equal to 100000000',
  })
  futureValue: number;
}
