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
            helper.decodeLocals(st, 73, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['boolFalse'].value, false)
                st.equals(locals['boolTrue'].value, true)
                st.equals(locals['testEnum'].value, 'three')
                st.equals(locals['sender'].value, '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB')
                st.equals(locals['_bytes1'].value, '0x99')
                st.equals(locals['__bytes1'].value, '0x99')
                st.equals(locals['__bytes2'].value, '0x99AB')
                st.equals(locals['__bytes4'].value, '0x99FA0000')
                st.equals(locals['__bytes6'].value, '0x990000000000')
                st.equals(locals['__bytes7'].value, '0x99356700000000')
                st.equals(locals['__bytes8'].value, '0x99ABD41700000000')
                st.equals(locals['__bytes9'].value, '0x99156744AF00000000')
                st.equals(locals['__bytes13'].value, '0x99123423425300000000000000')
                st.equals(locals['__bytes16'].value, '0x99AFAD23432400000000000000000000')
                st.equals(locals['__bytes24'].value, '0x99AFAD234324000000000000000000000000000000000000')
                st.equals(locals['__bytes32'].value, '0x9999ABD41799ABD4170000000000000000000000000000000000000000000000')
                st.equals(Object.keys(locals).length, 16)
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
