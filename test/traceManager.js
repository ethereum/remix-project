'use strict'
var TraceManager = require('../src/trace/traceManager')
var tape = require('tape')
var Web3Providers = require('../src/web3Provider/web3Providers')
var util = require('../src/helpers/global')
var web3Test = require('./resources/testWeb3')

tape('TraceManager', function (t) {
  var traceManager

  t.test('TraceManager.init', function (st) {
    var web3Providers = new Web3Providers()
    web3Providers.addProvider('TEST', web3Test)
    web3Providers.get('TEST', function (error, obj) {
      if (error) {
        var mes = 'provider TEST not defined'
        console.log(mes)
        st.fail(mes)
      } else {
        util.web3 = obj
        traceManager = new TraceManager()
        st.end()
      }
    })
  })

  t.test('TraceManager.resolveTrace', function (st) {
    var tx = util.web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    traceManager.resolveTrace(tx, function (error, result) {
      if (error) {
        st.fail(' - traceManager.resolveTrace - failed ' + result)
      } else {
        st.end()
      }
    })
  })

  t.test('TraceManager.getLength ', function (st) {
    traceManager.getLength(function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.end()
      }
    })
  })

  t.test('TraceManager.inRange ', function (st) {
    st.notOk(traceManager.inRange(-1))
    st.ok(traceManager.inRange(10))
    st.notOk(traceManager.inRange(142))
    st.ok(traceManager.inRange(141))
    st.end()
  })

  t.test('TraceManager.getStorageAt', function (st) {
    var tx = util.web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    traceManager.getStorageAt(110, tx, function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result['0x00'] === '0x38')
        st.end()
      }
    })
  })

  t.test('TraceManager.getCallData', function (st) {
    traceManager.getCallDataAt(0, function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result[0] === '0x60fe47b10000000000000000000000000000000000000000000000000000000000000038')
        st.end()
      }
    })
  })

  t.test('TraceManager.getCallStackAt', function (st) {
    st.plan(3)
    traceManager.getCallStackAt(0, function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result[0] === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      }
    })

    traceManager.getCallStackAt(64, function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result.length === 2)
        st.ok(result[1] === '(Contract Creation - Step 63)')
      }
    })
  })

  t.test('TraceManager.getStackAt', function (st) {
    st.plan(3)
    traceManager.getStackAt(0, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result.length === 0)
      }
    })

    traceManager.getStackAt(28, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result.length === 4)
        st.ok(result[3] === '0x60fe47b1')
      }
    })
  })

  t.test('TraceManager.getLastCallChangeSince', function (st) {
    st.plan(3)
    traceManager.getLastCallChangeSince(10, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 0)
      }
    })

    traceManager.getLastCallChangeSince(70, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 64)
      }
    })

    traceManager.getLastCallChangeSince(111, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 109)
      }
    })
  })

  t.test('TraceManager.getCurrentCalledAddressAt', function (st) {
    st.plan(3)
    traceManager.getCurrentCalledAddressAt(10, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      }
    })

    traceManager.getCurrentCalledAddressAt(70, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '(Contract Creation - Step 63)')
      }
    })

    traceManager.getCurrentCalledAddressAt(111, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      }
    })
  })

  t.test('TraceManager.getContractCreationCode', function (st) { // contract code has been retrieved from the memory
    traceManager.getContractCreationCode('(Contract Creation - Step 63)', function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '0x60606040526040516020806045833981016040528080519060200190919050505b806001016000600050819055505b50600a80603b6000396000f360606040526008565b00000000000000000000000000000000000000000000000000000000000000002d')
        st.end()
      }
    })
  })

  t.test('TraceManager.getMemoryAt', function (st) {
    st.plan(3)
    traceManager.getMemoryAt(0, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result.length === 0)
      }
    })

    traceManager.getMemoryAt(34, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result.length === 3)
        st.ok(result[2] === '0000000000000000000000000000000000000000000000000000000000000060')
      }
    })
  })

  t.test('TraceManager.getCurrentPC', function (st) {
    traceManager.getCurrentPC(13, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '65')
        st.end()
      }
    })
  })

  t.test('TraceManager.getCurrentStep', function (st) {
    traceManager.getCurrentStep(66, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 2)
        st.end()
      }
    })
  })

  t.test('TraceManager.getMemExpand', function (st) {
    traceManager.getMemExpand(2, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '3')
        st.end()
      }
    })
  })

  t.test('TraceManager.getStepCost', function (st) {
    traceManager.getStepCost(34, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '3')
        st.end()
      }
    })
  })

  t.test('TraceManager.getRemainingGas', function (st) {
    traceManager.getRemainingGas(55, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '79306')
        st.end()
      }
    })
  })

  t.test('TraceManager.findStepOverBack', function (st) {
    var result = traceManager.findStepOverBack(116)
    console.log(result)
    st.ok(result === -1)
    st.end()
  })

  t.test('TraceManager.findStepOverForward', function (st) {
    var result = traceManager.findStepOverForward(66)
    console.log(result)
    st.ok(result === 108)
    st.end()
  })

  t.test('TraceManager.findStepOutBack', function (st) {
    var result = traceManager.findStepOutBack(70)
    console.log(result)
    st.ok(result === 63)
    st.end()
  })

  t.test('TraceManager.findStepOutForward', function (st) {
    var result = traceManager.findStepOutForward(15)
    console.log(result)
    st.ok(result === 142)
    st.end()
  })

  t.test('TraceManager.findNextCall', function (st) {
    var result = traceManager.findNextCall(10)
    console.log(result)
    st.ok(result === 63)
    st.end()
  })

  t.test('TraceManager.getAddresses', function (st) {
    traceManager.getAddresses(function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result[0] === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
        st.ok(result[1] === '(Contract Creation - Step 63)')
        st.end()
      }
    })
  })

  t.test('TraceManager.getReturnValue', function (st) {
    traceManager.getReturnValue(108, function (error, result) {
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === '0x60606040526008565b00')
        st.end()
      }
    })
  })
})
