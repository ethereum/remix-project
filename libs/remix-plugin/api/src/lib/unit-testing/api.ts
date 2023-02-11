import { UnitTestResult } from './type'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IUnitTesting {
  events: {} & StatusEvents
  methods: {
    testFromPath(path: string): UnitTestResult
    testFromSource(sourceCode: string): UnitTestResult
  }
}
