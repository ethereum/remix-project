'use strict'
var TraceManager = require('../../../babelify-src/trace/traceManager')
var CodeManager = require('../../../babelify-src/code/codeManager')
var vmSendTx = require('./vmCall')
var traceHelper = require('../../../babelify-src/helpers/traceHelper')
var util = require('../../../babelify-src/helpers/global')
var SolidityProxy = require('../../../babelify-src/solidity/solidityProxy')
var InternalCallTree = require('../../../babelify-src/util/internalCallTree')
var EventManager = require('../../../babelify-src/lib/eventManager')
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
          var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalVariables: true })
          callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
            helper.decodeLocals(st, 1899, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['bytesSimple'].length, '0x14')
                st.equals(locals['bytesSimple'].value, '0x746573745f7375706572')
                st.equals(locals['e']['a'].value, 'test')
                st.equals(locals['e']['a'].length, '0x8')
                st.equals(locals['e']['a'].raw, '0x74657374')
                st.equals(locals['e']['b'], '5')
                st.equals(locals['e']['c'].length, '0x220')
                st.equals(locals['e']['c'].raw, '0x746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374')
                st.equals(locals['e']['c'].value, 'test_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_test')
                st.equals(locals['e']['d'], '3')
                st.equals(locals['f'].length, '0x1b8')
                st.equals(locals['f'].raw, '0x746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f')
                st.equals(locals['f'].value, 'test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_test_long_')
                st.equals(locals['e']['e'], true)

                st.equals(locals['simpleArray'][0], '45')
                st.equals(locals['simpleArray'][1], '324324')
                st.equals(locals['simpleArray'][2], '-333')
                st.equals(locals['simpleArray'][3], '5656')
                st.equals(locals['simpleArray'][4], '-1111')

                st.equals(locals['stringArray'][0].value, 'long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_long_one_')
                st.equals(locals['stringArray'][1].value, 'two')
                st.equals(locals['stringArray'][2].value, 'three')

                st.equals(locals['dynArray'][0][0], '3423423532')
                st.equals(locals['dynArray'][1][0], '-342343323532')
                st.equals(locals['dynArray'][1][1], '23432')
                st.equals(locals['dynArray'][2][0], '-432432')
                st.equals(locals['dynArray'][2][1], '3423423532')
                st.equals(locals['dynArray'][2][2], '-432432')

                st.equals(locals['structArray'][0]['a'].value, 'test')
                st.equals(locals['structArray'][0]['a'].length, '0x8')
                st.equals(locals['structArray'][0]['a'].raw, '0x74657374')
                st.equals(locals['structArray'][0]['b'], '5')
                st.equals(locals['structArray'][0]['c'].length, '0x220')
                st.equals(locals['structArray'][0]['c'].raw, '0x746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374746573745f6c6f6e675f746573745f6c6f6e675f746573745f6c6f6e675f74657374')
                st.equals(locals['structArray'][0]['c'].value, 'test_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_testtest_long_test_long_test_long_test')
                st.equals(locals['structArray'][0]['d'], '3')
                st.equals(locals['structArray'][0]['e'], true)

                st.equals(locals['structArray'][1]['a'].value, 'item1 a')
                st.equals(locals['structArray'][1]['b'], '20')
                st.equals(locals['structArray'][1]['c'].value, 'item1 c')
                st.equals(locals['structArray'][1]['d'], '-45')
                st.equals(locals['structArray'][1]['e'], false)

                st.equals(locals['structArray'][2]['a'].value, 'item2 a')
                st.equals(locals['structArray'][2]['b'], '200')
                st.equals(locals['structArray'][2]['c'].value, 'item2 c')
                st.equals(locals['structArray'][2]['d'], '-450')
                st.equals(locals['structArray'][2]['e'], true)

                st.equals(locals['arrayStruct'].a[0].value, 'string')
                st.equals(locals['arrayStruct'].b[0], '34')
                st.equals(locals['arrayStruct'].b[1], '-23')
                st.equals(locals['arrayStruct'].b[2], '-3')
                st.equals(locals['arrayStruct'].c, 'three')

                st.equals(Object.keys(locals).length, 8)
              } catch (e) {
                st.fail(e.message)
              }
            })

            helper.decodeLocals(st, 7, traceManager, callTree, function (locals) {
              try {
                st.equals(Object.keys(locals).length, 8)
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
