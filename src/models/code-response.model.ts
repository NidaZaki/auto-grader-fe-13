export class CodeResponse {
    status: string;
    testCaseList: TestCaseList[];
    testCaseGrouped: TestCaseGrouped[];
    instructorCode: string;
    description: string;
    output: string;
    score: number;
    deadline: string;
}

export interface TestCaseGrouped {
    name: string
    testCaseList: TestCaseList[]
    parentStatus: boolean
    parentNumberOfFailedTest: number;
    parentNumberOfPassedTest: number;
    totalNumberOfTestCases: number;
  }

export interface TestCaseList {
    name: string;
    testCaseFunctionName: string;
    argument: string;
    caught: string;
    expectedOutput: string;
    actualOutput: string;
    numberOfFailedTests: number;
    status: string;
    assertionArguments: string
  }

