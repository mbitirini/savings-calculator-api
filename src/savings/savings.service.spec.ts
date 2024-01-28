import { Test, TestingModule } from '@nestjs/testing';
import { SavingsService } from './savings.service';
import {
  CalculateFutureValueInputDto,
  TargetMonthlySavingsInputDto,
} from './dto/savings.input';
import { SavingsModel } from './models/savings.model';

// helper functions for calculating the formulas
const calculateExpectedFutureValue = (
  input: CalculateFutureValueInputDto,
): number => {
  const {
    currentPotSize,
    regularMonthlyContribution,
    annualGrowthRate,
    numberOfYears,
  } = input;

  // Compound Interest Formula: FV = C * (1 + i)^t + Pmt * 12 * (((1 + i)^t) - 1) / i
  const expectedValue =
    currentPotSize * Math.pow(1 + annualGrowthRate, numberOfYears) +
    regularMonthlyContribution *
      12 *
      ((Math.pow(1 + annualGrowthRate, numberOfYears) - 1) / annualGrowthRate);

  return expectedValue;
};

const calculateExpectedTargetMonthlySavings = (
  input: TargetMonthlySavingsInputDto,
): number => {
  const { currentPotSize, futureValue, annualGrowthRate, numberOfYears } =
    input;

  // Formula: Pmt = (FV - C * (1 + i) ^ t) / (12 * (((1 + i) ^ t - 1) / i))
  const expectedValue =
    (futureValue -
      currentPotSize * Math.pow(1 + annualGrowthRate, numberOfYears)) /
    (12 *
      ((Math.pow(1 + annualGrowthRate, numberOfYears) - 1) / annualGrowthRate));

  return expectedValue;
};

describe('SavingsService', () => {
  let service: SavingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavingsService],
    }).compile();

    service = module.get<SavingsService>(SavingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFutureValue', () => {
    it('should handle minimum input values', () => {
      const input: CalculateFutureValueInputDto = {
        currentPotSize: 0,
        regularMonthlyContribution: 0,
        annualGrowthRate: 0,
        numberOfYears: 1,
      };

      const result = service.calculateFutureValue(input);
      expect(result.futureValue).toBe(0);
    });

    it('should handle annual growth rate being 0', () => {
      const input: CalculateFutureValueInputDto = {
        currentPotSize: 0,
        regularMonthlyContribution: 10,
        annualGrowthRate: 0,
        numberOfYears: 2,
      };

      const result = service.calculateFutureValue(input);
      expect(result.futureValue).toBe(240);
    });

    it('should handle annual growth rate being 0 with zero monthly contribution', () => {
      const input: CalculateFutureValueInputDto = {
        currentPotSize: 500,
        regularMonthlyContribution: 0,
        annualGrowthRate: 0,
        numberOfYears: 8,
      };

      // Future value should remain the same
      const result = service.calculateFutureValue(input);
      expect(result.futureValue).toBe(500);
    });

    it('should calculate future value correctly', () => {
      const input: CalculateFutureValueInputDto = {
        currentPotSize: 100,
        regularMonthlyContribution: 100,
        annualGrowthRate: 0.05,
        numberOfYears: 10,
      };

      const result: SavingsModel = service.calculateFutureValue(input);
      const expectedValue = calculateExpectedFutureValue(input);
      expect(result.futureValue).toBeCloseTo(expectedValue, 2);
    });
  });

  describe('calculateTargetMonthlySavings', () => {
    it('should handle minimum input values', () => {
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 0,
        futureValue: 0,
        annualGrowthRate: 0,
        numberOfYears: 1,
      };

      const result = service.calculateTargetMonthlySavings(input);
      expect(result.regularMonthlyContribution).toBe(0);
    });

    it('should handle annual growth rate being 0', () => {
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 0,
        futureValue: 240,
        annualGrowthRate: 0,
        numberOfYears: 2,
      };

      const result = service.calculateTargetMonthlySavings(input);
      expect(result.regularMonthlyContribution).toBe(10);
    });

    it('should calculate regular monthly contribution correctly', () => {
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 100,
        futureValue: 15256.36,
        annualGrowthRate: 0.05,
        numberOfYears: 10,
      };

      const result: SavingsModel = service.calculateTargetMonthlySavings(input);
      const expectedResult = calculateExpectedTargetMonthlySavings(input);
      expect(result.regularMonthlyContribution).toBe(expectedResult);
    });

    it('should handle future value smaller than current pot size', () => {
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 500,
        futureValue: 400,
        annualGrowthRate: 0.05,
        numberOfYears: 5,
      };

      const result: SavingsModel = service.calculateTargetMonthlySavings(input);
      expect(result.regularMonthlyContribution).toBe(0);
    });

    it('should handle negative regular monthly contribution and return 0', () => {
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 1000,
        futureValue: 1200,
        annualGrowthRate: 0.2,
        numberOfYears: 1,
      };

      const result: SavingsModel = service.calculateTargetMonthlySavings(input);
      expect(result.regularMonthlyContribution).toBe(0);
    });

    it('should handle future value equal to current pot size and return 0 contribution', () => {
      // Set up input with a future value equal to the current pot size
      const input: TargetMonthlySavingsInputDto = {
        currentPotSize: 1000,
        futureValue: 1000,
        annualGrowthRate: 0.03,
        numberOfYears: 5,
      };

      // Calculate regular monthly contribution
      const result: SavingsModel = service.calculateTargetMonthlySavings(input);

      // Ensure that the regular monthly contribution is 0
      expect(result.regularMonthlyContribution).toBe(0);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
