import runTestFiles from './runTestFiles'
import runTestSources from './runTestSources'
import runTest from './testRunner'

module.exports = {
  runTestFiles: runTestFiles,
  runTestSources: runTestSources,
  runTest: runTest,
  assertLibCode: require('../sol/tests.sol.js')
}
