'use strict'
const tape = require('tape')
const Web3Providers = require('../src/web3Provider/web3Providers')
const TraceManager = require('../src/trace/traceManager')
const CodeManager = require('../src/code/codeManager')
const web3Test = require('./resources/testWeb3')

let web3 = null

tape('CodeManager', function (t) {
  let codeManager
  const web3Providers = new Web3Providers()
  web3Providers.addProvider('TEST', web3Test)
  web3Providers.get('TEST', function (error, obj) {
    if (error) {
      const mes = 'provider TEST not defined'
      console.log(mes)
      t.fail(mes)
    } else {
      web3 = obj
      const traceManager = new TraceManager({web3: web3})
      codeManager = new CodeManager(traceManager)
      const contractCode = web3.eth.getCode('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      codeManager.codeResolver.cacheExecutingCode('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', contractCode) // so a call to web3 is not necessary
      const tx = web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      traceManager.resolveTrace(tx, function (error, result) {
        if (error) {
          t.fail(' - traceManager.resolveTrace - failed ' + result)
        } else {
          continueTesting(t, codeManager)
        }
      })
    }
  })
})

function continueTesting (t, codeManager) {
  t.test('CodeManager.init', function (st) {
    st.end()
  })

  t.test('CodeManager.resolveStep', function (st) {
    st.plan(6)
    codeManager.event.register('changed', this, function (code, address, index) {
      if (index === undefined || index === null) {
        st.fail(index)
      } else {
        st.ok(index === 6 || index === 0)
      }
    })

    codeManager.event.register('changed', this, function (code, address, index) {
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
    const tx = web3.eth.getTransaction('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
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
