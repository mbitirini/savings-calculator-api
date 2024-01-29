import { Injectable } from '@nestjs/common';
import {
  CalculateFutureValueInputDto,
  TargetMonthlySavingsInputDto,
} from './dto/savings.input';
import { SavingsModel } from './models/savings.model';

@Injectable()
export class SavingsService {
  /**
   * Calculate the future value of a savings pot based on input parameters.
   * @param input - Input parameters including currentPotSize, regularMonthlyContribution, etc.
   * @returns SavingsModel with calculated future value.
   */
  calculateFutureValue(input: CalculateFutureValueInputDto): SavingsModel {
    const {
      currentPotSize,
      regularMonthlyAmount,
      annualGrowthRate,
      numberOfYears,
    } = input;

    // When annual growth rate is 0, the future value is the sum of
    // the initial pot size and total contributions over the years.
    // If annual growth rate > 0 then use the formula as expected
    // Formula: FV = C * (1 + i) ^ t + Pmt * 12 * (((1 + i) ^ t) - 1) / i
    const futureValue: number =
      annualGrowthRate === 0
        ? currentPotSize + regularMonthlyAmount * 12 * numberOfYears
        : currentPotSize * Math.pow(1 + annualGrowthRate, numberOfYears) +
          regularMonthlyAmount *
            12 *
            ((Math.pow(1 + annualGrowthRate, numberOfYears) - 1) /
              annualGrowthRate);

    return { ...input, futureValue };
  }

  /**
   * Calculate the necessary monthly savings to reach a target pot size.
   * @param input - Input parameters including currentPotSize, futureValue, etc.
   * @returns SavingsModel with calculated regular monthly contribution.
   */
  calculateTargetMonthlySavings(
    input: TargetMonthlySavingsInputDto,
  ): SavingsModel {
    const { currentPotSize, futureValue, annualGrowthRate, numberOfYears } =
      input;

    if (futureValue <= currentPotSize) {
      // Goal is already achieved, no additional contributions needed
      return { ...input, regularMonthlyAmount: 0 };
    }

    // When annual growth rate is 0, the monthly savings
    // is the difference between future value and current pot size,
    // divided by the total number of months.
    // If annual growth rate > 0 then use the formula as expected
    // Formula: Pmt = (FV - C * (1 + i) ^ t) / (12 * (((1 + i) ^ t - 1) / i))
    let regularMonthlyAmount: number =
      annualGrowthRate === 0
        ? (futureValue - currentPotSize) / (12 * numberOfYears)
        : (futureValue -
            currentPotSize * Math.pow(1 + annualGrowthRate, numberOfYears)) /
          (12 *
            ((Math.pow(1 + annualGrowthRate, numberOfYears) - 1) /
              annualGrowthRate));

    // Ensure regularMonthlyContribution is not negative
    regularMonthlyAmount = regularMonthlyAmount < 0 ? 0 : regularMonthlyAmount;

    return { ...input, regularMonthlyAmount };
  }
}
