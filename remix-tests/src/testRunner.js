var async = require('async')
var changeCase = require('change-case')
var Web3 = require('web3')

function getFunctionFullName (signature, methodIdentifiers) {
  for (var method in methodIdentifiers) {
    if (signature.replace('0x', '') === methodIdentifiers[method].replace('0x', '')) {
      return method
    }
  }
  return null
}

function getOverridedSender (userdoc, signature, methodIdentifiers) {
  let fullName = getFunctionFullName(signature, methodIdentifiers)
  return fullName && userdoc.methods[fullName] ? userdoc.methods[fullName].notice : null
}

function getAvailableFunctions (jsonInterface) {
  return jsonInterface.reverse().filter((x) => x.type === 'function').map((x) => x.name)
}

function getTestFunctions (jsonInterface) {
  let specialFunctions = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach']
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
    runList.push({name: func.name, signature: func.signature, type: 'test', constant: func.constant})
    if (availableFunctions.indexOf('afterEach') >= 0) {
      runList.push({name: 'afterEach', type: 'internal', constant: false})
    }
  }

  if (availableFunctions.indexOf('afterAll') >= 0) {
    runList.push({name: 'afterAll', type: 'internal', constant: false})
  }

  return runList
}

function runTest (testName, testObject, contractDetails, opts, testCallback, resultsCallback) {
  let runList = createRunList(testObject._jsonInterface)

  let passingNum = 0
  let failureNum = 0
  let timePassed = 0
  let web3 = new Web3()

  var userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
  var isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)
  if (!isBrowser) {
    let signale = require('signale')
    signale.warn('DO NOT TRY TO ACCESS (IN YOUR SOLIDITY TEST) AN ACCOUNT GREATER THAN THE LENGTH OF THE FOLLOWING ARRAY (' + opts.accounts.length + ') :')
    signale.warn(opts.accounts)
    signale.warn('e.g: the following code won\'t work in the current context:')
    signale.warn('TestsAccounts.getAccount(' + opts.accounts.length + ')')
  }

  testCallback({type: 'contract', value: testName, filename: testObject.filename})
  async.eachOfLimit(runList, 1, function (func, index, next) {
    let sender
    if (func.signature) {
      sender = getOverridedSender(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers)
      if (opts.accounts) {
        sender = opts.accounts[sender]
      }
    }
    let sendParams
    if (sender) sendParams = { from: sender }

    let method = testObject.methods[func.name].apply(testObject.methods[func.name], [])
    let startTime = Date.now()
    if (func.constant) {
      method.call(sendParams).then((result) => {
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
      method.send(sendParams).on('receipt', function (receipt) {
        try {
          let time = Math.ceil((Date.now() - startTime) / 1000.0)
          let topic = Web3.utils.sha3('AssertionEvent(bool,string)')

          let testPassed = false

          for (let i in receipt.events) {
            let event = receipt.events[i]
            if (event.raw.topics.indexOf(topic) >= 0) {
              var testEvent = web3.eth.abi.decodeParameters(['bool', 'string'], event.raw.data)
              if (!testEvent[0]) {
                testCallback({type: 'testFailure', value: changeCase.sentenceCase(func.name), time: time, errMsg: testEvent[1], context: testName})
                failureNum += 1
                return next()
              }
              testPassed = true
            }
          }

          if (testPassed) {
            testCallback({type: 'testPass', value: changeCase.sentenceCase(func.name), time: time, context: testName})
            passingNum += 1
          }

          return next()
        } catch (err) {
          console.log('error!')
          console.dir(err)
          return next(err)
        }
      }).on('error', function (err) {
        console.error(err)
        next(err)
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
