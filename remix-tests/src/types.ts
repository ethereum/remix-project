/** sources object with name of the file and content **/
export interface SrcIfc {
  [key: string]: {
    content: string
  }
}
/** An object with final results of test **/
export interface FinalResult {
    totalPassing: number,
    totalFailing: number,
    totalTime: number,
    errors: any[],
}
/** List of tests to run **/
export interface RunListInterface {
  name: string,
  type: string,
  constant: boolean,
  signature?: any
}
export interface ResultsInterface {
    passingNum: number,
    failureNum: number,
    timePassed: number
}
export interface TestResultInterface {
  type: string,
  value: any,
  time?: number,
  context?: string,
  errMsg?: string
  filename?: string
}
export interface TestCbInterface {
  (error: Error | null | undefined, result: TestResultInterface) : void;
}
export interface ResultCbInterface {
  (error: Error | null | undefined, result: ResultsInterface) : void;
}
