'use strict'

import deepequal from 'deep-equal'
import { sendTx } from '../vmCall'
import { TraceManager } from '../../../src/trace/traceManager'
import { CodeManager } from '../../../src/code/codeManager'
import { SolidityProxy } from '../../../src/solidity-decoder/solidityProxy'
import { InternalCallTree } from '../../../src/solidity-decoder/internalCallTree'
import { EventManager } from '../../../src/eventManager'
import * as helper from './helper'

module.exports = async function (st, vm, privateKey, contractBytecode, compilationResult) {
  let txHash
  try {
    let data = await sendTx(vm, { nonce: 0, privateKey: privateKey }, null, 0, contractBytecode)
    const to = (data as any).result.createdAddress.toString()
    // call to level11
    data = await sendTx(vm, { nonce: 1, privateKey: privateKey }, to, 0, 'a372a595000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001520000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015400000000000000000000000000000000000000000000000000000000000000')
    txHash = (data as any).hash
  } catch (e) {
    return st.fail(e)
  }
  return new Promise((resolve) => {    
    vm.web3.eth.getTransaction(txHash, function (error, tx) {
      if (error) {
        return st.fail(error)
      }
      var traceManager = new TraceManager({ web3: vm.web3 })
      var codeManager = new CodeManager(traceManager)
      codeManager.clear()
      var solidityProxy = new SolidityProxy({ getCurrentCalledAddressAt: traceManager.getCurrentCalledAddressAt.bind(traceManager), getCode: codeManager.getCode.bind(codeManager) })
      solidityProxy.reset(compilationResult)
      var debuggerEvent = new EventManager()
      var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalVariables: true })
      callTree.event.register('callTreeBuildFailed', (error) => {
        st.fail(error)
      })
      callTree.event.register('callTreeNotReady', (reason) => {
        st.fail(reason)
      })
      callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
        helper.decodeLocals(st, 140, traceManager, callTree, function (locals) {
          try {
            const expected = {"p":{"value":"45","type":"uint256"},"foo":{"length":"1","value":[{"value":"3","type":"uint8"}],"type":"uint8[1]"},"boo":{"length":"1","value":[{"length":"2","value":[{"value":"R","type":"string"},{"value":"T","type":"string"}],"type":"string[2]"}],"type":"string[2][1]"}}
            st.deepEqual(locals, expected)
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
}