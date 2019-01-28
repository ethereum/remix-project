import runTestFiles from './runTestFiles.ts'
import runTestSources from './runTestSources.ts'
import TestRunner from './testRunner.ts'

module.exports = {
  runTestFiles: runTestFiles,
  runTestSources: runTestSources,
  runTest: TestRunner.runTest,
  assertLibCode: require('../sol/tests.sol.js')
}
