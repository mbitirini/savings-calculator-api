import { Module } from '@nestjs/common';
import { SavingsResolver } from './savings.resolver';
import { SavingsService } from './savings.service';

@Module({
  providers: [SavingsResolver, SavingsService],
})
export class SavingsModule {}
