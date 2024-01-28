import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import {
  CalculateFutureValueInputDto,
  TargetMonthlySavingsInputDto,
} from './dto/savings.input';
import { SavingsModel } from './models/savings.model';
import { SavingsService } from './savings.service';

@Resolver()
export class SavingsResolver {
  constructor(private readonly savingsService: SavingsService) {}

  @Mutation(() => SavingsModel)
  async calculateFutureValue(
    @Args('input') input: CalculateFutureValueInputDto,
  ) {
    return this.savingsService.calculateFutureValue(input);
  }

  @Mutation(() => SavingsModel)
  async calculateTargetMonthlySavings(
    @Args('input') input: TargetMonthlySavingsInputDto,
  ) {
    return this.savingsService.calculateTargetMonthlySavings(input);
  }

  // This query is added to satisfy schema generation requirements.
  // GraphQL schema generation often requires at least one query to be defined in the resolver.
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
