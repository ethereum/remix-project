var async = require('async')
var changeCase = require('change-case')

function getAvailableFunctions (jsonInterface) {
  return jsonInterface.reverse().filter((x) => x.type === 'function').map((x) => x.name)
}

function getTestFunctions (jsonInterface) {
  let specialFunctions = ['beforeAll', 'beforeEach']
  return jsonInterface.filter((x) => specialFunctions.indexOf(x.name) < 0 && x.type === 'function')
}

function createRunList (jsonInterface) {
  let availableFunctions = getAvailableFunctions(jsonInterface)
  let testFunctions = getTestFunctions(jsonInterface)
  let runList = []

  if (availableFunctions.indexOf('beforeAll') >= 0) {
    runList.push({name: 'beforeAll', type: 'internal', constant: false})
  }

  for (let func of testFunctions) {
    if (availableFunctions.indexOf('beforeEach') >= 0) {
      runList.push({name: 'beforeEach', type: 'internal', constant: false})
    }
    runList.push({name: func.name, type: 'test', constant: func.constant})
  }

  return runList
}

function runTest (web3, testName, testObject, testCallback, resultsCallback) {
  let runList = createRunList(testObject._jsonInterface)

  let passingNum = 0
  let failureNum = 0
  let timePassed = 0

  testCallback({type: 'contract', value: testName})
  async.eachOfLimit(runList, 1, function (func, index, next) {
    let method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
    let startTime = Date.now()
    if (func.constant) {
      method.call().then((result) => {
        let time = Math.ceil((Date.now() - startTime) / 1000.0)
        if (result) {
          testCallback({type: 'testPass', value: changeCase.sentenceCase(func.name), time: time, context: testName})
          passingNum += 1
          timePassed += time
        } else {
          testCallback({type: 'testFailure', value: changeCase.sentenceCase(func.name), time: time, errMsg: 'function returned false', context: testName})
          failureNum += 1
        }
        next()
      })
    } else {
      method.send().on('receipt', function (receipt) {
        let time = Math.ceil((Date.now() - startTime) / 1000.0)
        if (func.type === 'test') {
          let topic = web3.utils.sha3('AssertionEvent(bool,string)')

          let matchingEvents = []
          for (let i in receipt.events) {
            let event = receipt.events[i]
            if (event.raw.topics.indexOf(topic) >= 0) {
              matchingEvents.push(web3.eth.abi.decodeParameters(['bool', 'string'], event.raw.data))
            }
          }

          if (matchingEvents.length === 0) {
            return next()
          }

          let result = matchingEvents[0]

          if (result[0]) {
            testCallback({type: 'testPass', value: changeCase.sentenceCase(func.name), time: time, context: testName})
            passingNum += 1
          } else {
            testCallback({type: 'testFailure', value: changeCase.sentenceCase(func.name), time: time, errMsg: result[1], context: testName})
            failureNum += 1
          }
        }
        next()
      })
    }
  }, function () {
    resultsCallback(null, {
      passingNum: passingNum,
      failureNum: failureNum,
      timePassed: timePassed
    })
  })
}

module.exports = {
  runTest: runTest
}
