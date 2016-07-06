'use strict'
var tape = require('tape')
var init = require('../src/helpers/init')
var TraceManager = require('../src/trace/traceManager')
var CodeManager = require('../src/code/codeManager')
var web3Test = require('./resources/testWeb3')
var initWeb3 = require('./init')

tape('CodeManager', function (t) {
  var codeManager
  var web3 = init.loadWeb3()
  initWeb3.overrideWeb3(web3, web3Test)
  var traceManager = new TraceManager(web3)
  codeManager = new CodeManager(web3, traceManager)
  var contractCode = web3.eth.getCode('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
  codeManager.codeResolver.cacheExecutingCode('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', contractCode) // so a call to web3 is not necessary
  var tx = web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
  traceManager.resolveTrace(tx, function (error, result) {
    if (error) {
      t.fail(' - traceManager.resolveTrace - failed ' + result)
    } else {
      continueTesting(t, codeManager)
    }
  })
})

function continueTesting (t, codeManager) {
  t.test('CodeManager.init', function (st) {
    st.end()
  })

  t.test('CodeManager.resolveStep', function (st) {
    st.plan(6)
    codeManager.register('indexChanged', this, function (index) {
      if (index === undefined || index === null) {
        st.fail(index)
      } else {
        st.ok(index === 6 || index === 0)
      }
    })

    codeManager.register('codeChanged', this, function (code, address, index) {
      console.log(address + ' ' + index + ' ' + code)
      if (!code) {
        st.fail('no codes')
      } else {
        st.ok(address === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5' || address === '(Contract Creation - Step 63)')
        if (address === '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5') {
          console.log(address + ' ' + code[25])
          st.ok(code[25].indexOf('DUP') !== -1)
        } else if (address === '(Contract Creation - Step 63)') {
          console.log(address + ' ' + code[25])
          st.ok(code[25].indexOf('JUMPDEST') !== -1)
        }
      }
    })
    var tx = codeManager.web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    codeManager.resolveStep(0, tx)
    codeManager.resolveStep(70, tx)
  })

  t.test('CodeManager.getInstructionIndex', function (st) {
    st.plan(2)
    codeManager.getInstructionIndex('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', 16, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 25)
      }
    })

    codeManager.getInstructionIndex('(Contract Creation - Step 63)', 70, function (error, result) {
      console.log(result)
      if (error) {
        st.fail(error)
      } else {
        st.ok(result === 6)
      }
    })
  })
}
