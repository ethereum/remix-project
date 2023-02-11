export interface UnitTestResult {
  totalFailing: number
  totalPassing: number
  totalTime: number
  errors: UnitTestError[]
}

export interface UnitTestError {
  context: string
  value: string
  message: string
}