const rr = require('../src/index.js')
const assert = require('assert')
const fs = require('fs')

describe('testRunner', function () {
  describe('#combineSource', function() {
    describe('test with beforeAll', function () {
      let filename = 'tests/examples_1/greeter.sol'
      let tests = [], results = {}

      before(function (done) {
        const content = fs.readFileSync('../remix-resolve/tests/example_1/greeter.sol')
        var sources = []
        sources['greeter.sol'] = content
        rr.combineSource('/home/0mkar/Karma/remix/remix-resolve/tests/example_1/greeter.sol', sources)
      })

      it('should 1 passing test', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 1 failing test', function () {
        assert.equal(results.failureNum, 2)
      })

      it('should returns 5 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract',    value: 'MyTest', filename: 'simple_storage_test.sol' },
          { type: 'testFailure', value: 'Should trigger one fail', time: 1, context: 'MyTest', errMsg: 'the test 1 fails' },
          { type: 'testPass',    value: 'Should trigger one pass', time: 1, context: 'MyTest'},
          { type: 'testPass',    value: 'Initial value should be100', time: 1, context: 'MyTest' },
          { type: 'testFailure', value: 'Initial value should be200', time: 1, context: 'MyTest', errMsg: 'function returned false' }
        ])
      })
    })
  })
})
