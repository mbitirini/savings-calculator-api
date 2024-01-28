# Savings Calculator

A simple NestJS application for calculating the future value of a savings pot and determining the necessary monthly savings to reach a target pot size.

## Installation

1. Clone the repository
2. Install dependencies:

```
npm install
```

## Usage

Start the NestJS application:

```
npm run start
```

### Running the Application using Apollo

1. Open your web browser

2. Navigate to http://localhost:3000/graphql to access the GraphQL Playground

3. Try executing the provided mutations:

#### Calculate Future Value:

```
mutation CalculateFutureValue($input: CalculateFutureValueInputDto!) {
  calculateFutureValue(input: $input) {
    currentPotSize
    regularMonthlyContribution
    annualGrowthRate
    numberOfYears
    futureValue
  }
}

```

and put on Query variables your desired inputs, for example:

```
{
  "input": {
    "currentPotSize": 100000,
    "regularMonthlyContribution": 3750,
    "annualGrowthRate": 0.05,
    "numberOfYears": 1
  }
}
```
<img width="1440" alt="playgroundsuccess-1" src="https://github.com/mbitirini/savings-calculator-api/assets/69593342/b6ceb4a5-d115-4658-b17e-a2103f10020d">

#### Calculate Target Monthly Savings:

```
mutation CalculateTargetMonthlySavings($input: TargetMonthlySavingsInputDto!) {
  calculateTargetMonthlySavings(input: $input) {
    currentPotSize
    regularMonthlyContribution
    annualGrowthRate
    numberOfYears
    futureValue
  }
}
```

and put on Query variables your desired inputs, for example:

```
{
  "input": {
    "currentPotSize": 100000,
    "futureValue": 150000,
    "annualGrowthRate": 0.05,
    "numberOfYears": 1
  }
}
```
<img width="1438" alt="playgroundsuccess-2" src="https://github.com/mbitirini/savings-calculator-api/assets/69593342/04076e9b-d5b7-40d7-87b5-35b44660dc98">

### Running the Application using Postman

1. Open your Postman application
2. Create a new request:

- Set the request method to `POST`
- Set the request URL to http://localhost:3000/graphql.
- In the request body, select GraphQL and enter the mutation
- Click the Play button

  
3. Click the "Send" button to make the request.
4. Observe the response in the body of the Postman response panel.

Example for Calculate Future Value:

```
mutation {
  calculateFutureValue(input: {
    currentPotSize: 1000,
    regularMonthlyContribution: 50,
    annualGrowthRate: 0.05,
    numberOfYears: 5
  }) {
    currentPotSize,
    regularMonthlyContribution,
    annualGrowthRate,
    numberOfYears,
    futureValue
  }
}

```

<img width="1389" alt="postmansuccess-1" src="https://github.com/mbitirini/savings-calculator-api/assets/69593342/fea59ffd-7286-4347-87db-a7fd8bae6bf3">


Example for Calculate Target Monthly Savings:

```
mutation {
  calculateTargetMonthlySavings(input: {
    currentPotSize: 1000,
    futureValue: 1500,
    annualGrowthRate: 0.03,
    numberOfYears: 5
  }) {
    currentPotSize,
    futureValue,
    annualGrowthRate,
    numberOfYears,
    regularMonthlyContribution
  }
}
```

<img width="1325" alt="postmansuccess-2" src="https://github.com/mbitirini/savings-calculator-api/assets/69593342/b7590a04-cfff-498f-a103-aae4da824a98">

### Testing

I have implemented unit testing (`savings.service.spec.ts`) for the services and an end-to-end test (`savings.e2e-spec.ts`) with basic implementation, in order to check that validators used in DTO work as expected.

In order to run these tests:

- For unit testing:

```
npm run test
```

- For e2e testing:

```
npm run test:e2e
```

## Project Structure

```
savings-calculator-api/
|-- src/
|   |-- savings/
|       |-- dto/
|           |-- savings.input.ts
|       |-- models/
|           |-- savings.model.ts
|       |-- savings.service.ts
|       |-- savings.service.spec.ts
|       |-- savings.resolver.ts
|       |-- savings.module.ts
|   |-- app.module.ts
|   |-- main.ts
|-- test/
    |-- savings.e2e-spec.ts
```

## Technical Decisions

In a real-life application, the determination of these decisions would be a collaborative decision involving discussions with the development team, financial experts and stakeholders to align with the app's intended use cases and industry standards.
In order to complete this task though, I took roughly these decisions:

### Input Types and Value Limits

- Used `Float` type for `currentPotSize`, `regularMonthlyContribution`, `futureValue` and `annualGrowthRate`. `Int` type is used for `numberOfYears`
- The selected input value limits for the variables have been chosen to accommodate a broad range of financial scenarios while preventing extreme or unrealistic values.

### Handling edge cases

#### Annual Growth Rate is 0

When annual growth rate is 0, there is a risk of having a NaN (since we divide with 0). In order to handle this:

- The future value is the sum of the initial pot size and total contributions over the years

```
futureValue = currentPotSize + regularMonthlyContribution * 12 * numberOfYears
```

- The monthly savings is the difference between future value and current pot size, divided by the total number of months

```
regularMonthlyContribution = (futureValue - currentPotSize) / (12 * numberOfYears)
```

#### Negative Result in Monthly Savings Amount

In some edge cases, when the
monthly savings target is calculated the result is negative.
I checked that some calculators online return the negative result, while others return 0 (like this [one](https://moneysmart.gov.au/saving/savings-goals-calculator#!focus=1))

Typically, when calculating the necessary monthly savings, you would expect a positive value indicating the amount you need to contribute regularly to achieve the specified future value (at least I have this idea, I'm not so aware of economical terms :P)

In the scope of this API, I decided that the implementation ensures that a negative result is treated as zero.

#### Future Value is bigger or equal than Current Pot Size

Again in the case of calculating the monthly savings target,
some online calculators don't have a special way to handle this exception.

In the scope of this API, I decided that if the Future Value is bigger or equal than Current Pot Size then the goal is achieved so the regular monthly contributions needed are zero.

### Rounding in Financial Calculations

The application does not round the calculated values. The API returns precise results for calculations, prioritizing accuracy.

## Notes

I've observed a slight variance in results compared to online calculators. Despite adhering closely to the provided formulas, discrepancies might arise from rounding or precision differences. I value precision and welcome feedback or guidance to align with expected results. Additionally, insights into rounding or precision conventions for this calculation would be appreciated.
