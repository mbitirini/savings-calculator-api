import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('SavingsController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  it('should return validation error for invalid input', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            calculateFutureValue(input: {
              currentPotSize: -1000,
              regularMonthlyContribution: 50,
              annualGrowthRate: 1.5,
              numberOfYears: 5
            }) {
              currentPotSize,
              regularMonthlyContribution,
              annualGrowthRate,
              numberOfYears,
              futureValue
            }
          }
        `,
      })
      .expect((response) => {
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain(
          'Bad Request Exception',
        );

        const errorMessages =
          response.body.errors[0].extensions.originalError.message;
        expect(errorMessages).toContain(
          'Current Pot Size must be greater than or equal to 0',
        );
        expect(errorMessages).toContain(
          'Annual growth rate must be less than or equal to 1',
        );
        // Check that calculateFutureValue and calculateTargetMonthlySavings are not defined in the response
        expect(response.body.data).toBeNull();
      });
  });

  it('should successfully calculate future value for valid input', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            calculateFutureValue(input: {
              currentPotSize: 100000,
              regularMonthlyContribution: 3750,
              annualGrowthRate: 0.05,
              numberOfYears: 1
            }) {
              currentPotSize,
              regularMonthlyContribution,
              annualGrowthRate,
              numberOfYears,
              futureValue
            }
          }
        `,
      })
      .expect(({ body }) => {
        expect(body.errors).toBeUndefined();
        expect(body.data).toBeDefined();
        expect(body.data.calculateFutureValue).toBeDefined();
        expect(body.data.calculateFutureValue.futureValue).toBeCloseTo(
          150000,
          2,
        );
      });
  });

  it('should successfully calculate target monthly savings for valid input', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            calculateTargetMonthlySavings(input: {
              currentPotSize: 100000,
              futureValue: 150000,
              annualGrowthRate: 0.05,
              numberOfYears: 1
            }) {
              currentPotSize,
              futureValue,
              annualGrowthRate,
              numberOfYears,
              regularMonthlyContribution
            }
          }
        `,
      })
      .expect(({ body }) => {
        expect(body.errors).toBeUndefined();
        expect(body.data).toBeDefined();
        expect(body.data.calculateTargetMonthlySavings).toBeDefined();
        expect(
          body.data.calculateTargetMonthlySavings.regularMonthlyContribution,
        ).toBeCloseTo(3750, 2);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
