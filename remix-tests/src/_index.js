const runTestFiles = require('./runTestFiles.js')
const runTestSources = require('./runTestSources.js')
const TestRunner = require('./testRunner.js')

module.exports = {
  runTestFiles: runTestFiles,
  runTestSources: runTestSources,
  runTest: TestRunner.runTest,
  assertLibCode: require('../sol/tests.sol.js')
}
