'use strict'
var TraceManager = require('../../../src/trace/traceManager')
var CodeManager = require('../../../src/code/codeManager')
var vmSendTx = require('./vmCall')
var traceHelper = require('../../../src/helpers/traceHelper')
var util = require('../../../src/helpers/global')
var SolidityProxy = require('../../../src/solidity/solidityProxy')
var InternalCallTree = require('../../../src/util/internalCallTree')
var EventManager = require('../../../src/lib/eventManager')
var helper = require('./helper')

module.exports = function (st, vm, privateKey, contractBytecode, compilationResult, cb) {
  vmSendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, contractBytecode, function (error, txHash) {
    if (error) {
      st.fail(error)
    } else {
      util.web3.getTransaction(txHash, function (error, tx) {
        if (error) {
          st.fail(error)
        } else {
          tx.to = traceHelper.contractCreationToken('0')
          var traceManager = new TraceManager()
          var codeManager = new CodeManager(traceManager)
          codeManager.clear()
          var solidityProxy = new SolidityProxy(traceManager, codeManager)
          solidityProxy.reset(compilationResult)
          var debuggerEvent = new EventManager()
          var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalsVariables: true })
          callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
            helper.decodeLocals(st, 10, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['sender'], '0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db')
                st.equals(Object.keys(locals).length, 1)
              } catch (e) {
                st.fail(e.message)
              }
            })

            helper.decodeLocals(st, 4, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['sender'], '0x0000000000000000000000000000000000000000')
                st.equals(Object.keys(locals).length, 1)
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
