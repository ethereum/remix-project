var async = require('async')
var changeCase = require('change-case')

function runTest (testName, testObject, testCallback, resultsCallback) {
  let runList = []
  let specialFunctions = ['beforeAll', 'beforeEach']
  let availableFunctions = testObject._jsonInterface.reverse().filter((x) => x.type === 'function').map((x) => x.name)
  let testFunctions = testObject._jsonInterface.filter((x) => specialFunctions.indexOf(x.name) < 0 && x.type === 'function')

  if (availableFunctions.indexOf('beforeAll') >= 0) {
    runList.push({name: 'beforeAll', type: 'internal', constant: false})
  }

  for (let func of testFunctions) {
    if (availableFunctions.indexOf('beforeEach') >= 0) {
      runList.push({name: 'beforeEach', type: 'internal', constant: false})
    }
    runList.push({name: func.name, type: 'test', constant: func.constant})
  }

  let passingNum = 0
  let failureNum = 0

  testCallback({type: 'contract', value: testName})
  async.eachOfLimit(runList, 1, function (func, index, next) {
    let method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
    if (func.constant) {
      method.call().then((result) => {
        if (result) {
          testCallback({type: 'testPass', value: changeCase.sentenceCase(func.name)})
          passingNum += 1
        } else {
          testCallback({type: 'testFailure', value: changeCase.sentenceCase(func.name)})
          failureNum += 1
        }
        next()
      })
    } else {
      method.send().then(() => {
        next()
      })
    }
  }, function () {
    resultsCallback(null, {
      passingNum: passingNum,
      failureNum: failureNum
    })
  })
}

module.exports = {
  runTest: runTest
}
