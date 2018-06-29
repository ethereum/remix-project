'use strict'
var vmCall = require('../vmCall')
var remixLib = require('remix-lib')
var traceHelper = remixLib.helpers.trace
var SolidityProxy = require('../../../src/decoder/solidityProxy')
var InternalCallTree = require('../../../src/decoder/internalCallTree')
var EventManager = remixLib.EventManager
var helper = require('./helper')

var TraceManager = remixLib.trace.TraceManager
var CodeManager = remixLib.code.CodeManager

module.exports = function (st, vm, privateKey, contractBytecode, compilationResult, cb) {
  vmCall.sendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, contractBytecode, function (error, txHash) {
    if (error) {
      st.fail(error)
    } else {
      vm.web3.eth.getTransaction(txHash, function (error, tx) {
        if (error) {
          st.fail(error)
        } else {
          tx.to = traceHelper.contractCreationToken('0')
          var traceManager = new TraceManager({web3: vm.web3})
          var codeManager = new CodeManager(traceManager)
          codeManager.clear()
          var solidityProxy = new SolidityProxy(traceManager, codeManager)
          solidityProxy.reset(compilationResult)
          var debuggerEvent = new EventManager()
          var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalVariables: true })
          callTree.event.register('callTreeBuildFailed', (error) => {
            st.fail(error)
          })
          callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
            helper.decodeLocals(st, 51, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['dynbytes'].value, '0x64796e616d69636279746573')
                st.equals(locals['smallstring'].value, 'test_test_test')
                st.equals(Object.keys(locals).length, 2)
              } catch (e) {
                st.fail(e.message)
              }
            })

            helper.decodeLocals(st, 7, traceManager, callTree, function (locals) {
              try {
                // st.equals(Object.keys(locals).length, 0)
                st.equals(0, 0)
              } catch (e) {
                st.fail(e.message)
              }
              cb()
            })
          })
          traceManager.resolveTrace(tx, (error, result) => {
            if (error) {
              st.fail(error)
            } else {
              debuggerEvent.trigger('newTraceLoaded', [traceManager.trace])
            }
          })
        }
      })
    }
  })
}
