'use strict'
import * as vmCall from '../../vmCall'
import { contractCreationToken } from '../../../src/trace/traceHelper'
import { SolidityProxy } from '../../../src/solidity-decoder/solidityProxy'
import { InternalCallTree } from '../../../src/solidity-decoder/internalCallTree'
import { EventManager } from '../../../src/eventManager'
import * as helper from './helper'
import { TraceManager } from '../../../src/trace/traceManager'
import { CodeManager } from '../../../src/code/codeManager'

module.exports = function (st, privateKey, contractBytecode, compilationResult) {
  return new Promise(async (resolve) => {
    const web3 = await (vmCall as any).getWeb3();
    (vmCall as any).sendTx(web3, { nonce: 0, privateKey: privateKey }, null, 0, contractBytecode, function (error, hash) {
      if (error) {
        return st.fail(error)
      }
      web3.eth.getTransaction(hash, function (error, tx) {
        if (error) {
          return st.fail(error)
        }
        tx.to = contractCreationToken('0')
        var traceManager = new TraceManager({ web3 })
        var codeManager = new CodeManager(traceManager)
        codeManager.clear()
        var solidityProxy = new SolidityProxy({ getCurrentCalledAddressAt: traceManager.getCurrentCalledAddressAt.bind(traceManager), getCode: codeManager.getCode.bind(codeManager) })
        solidityProxy.reset(compilationResult)
        var debuggerEvent = new EventManager()
        var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalVariables: true })
        callTree.event.register('callTreeBuildFailed', (error) => {
          st.fail(error)
        })
        callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
          helper.decodeLocals(st, 49, traceManager, callTree, function (locals) {
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
            resolve({})
          })
        })
        traceManager.resolveTrace(tx).then(() => {
          debuggerEvent.trigger('newTraceLoaded', [traceManager.trace])
        }).catch((error) => {
          st.fail(error)
        })
      })
    })
  })  
}
