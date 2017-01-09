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
            try {
              st.equals(scopeStarts[0], '')
              st.equals(scopeStarts[97], '1')
              st.equals(scopeStarts[112], '1.1')
              st.equals(scopeStarts[135], '2')
              st.equals(scopeStarts[154], '3')
              st.equals(scopeStarts[169], '3.1')
              st.equals(scopes[''].locals['ui8'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui16'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui32'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui64'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui128'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui256'].type.typeName, 'uint')
              st.equals(scopes[''].locals['ui'].type.typeName, 'uint')
              st.equals(scopes[''].locals['i8'].type.typeName, 'int')
              st.equals(scopes[''].locals['i16'].type.typeName, 'int')
              st.equals(scopes[''].locals['i32'].type.typeName, 'int')
              st.equals(scopes[''].locals['i64'].type.typeName, 'int')
              st.equals(scopes[''].locals['i128'].type.typeName, 'int')
              st.equals(scopes[''].locals['i256'].type.typeName, 'int')
              st.equals(scopes[''].locals['i'].type.typeName, 'int')
              st.equals(scopes[''].locals['ishrink'].type.typeName, 'int')
              st.equals(scopes['1'].locals['ui8'].type.typeName, 'uint')
              st.equals(scopes['1.1'].locals['ui81'].type.typeName, 'uint')
              st.equals(scopes['2'].locals['ui81'].type.typeName, 'uint')
              st.equals(scopes['3'].locals['ui8'].type.typeName, 'uint')
              st.equals(scopes['3.1'].locals['ui81'].type.typeName, 'uint')
            } catch (e) {
              st.fail(e.message)
            }

            helper.decodeLocals(st, 125, traceManager, callTree, function (locals) {
              st.equals(Object.keys(locals).length, 16)
              st.equals(locals['ui8'], '130')
              st.equals(locals['ui16'], '456')
              st.equals(locals['ui32'], '4356')
              st.equals(locals['ui64'], '3543543543')
              st.equals(locals['ui128'], '234567')
              st.equals(locals['ui256'], '115792089237316195423570985008687907853269984665640564039457584007880697216513')
              st.equals(locals['ui'], '123545666')
              st.equals(locals['i8'], '-45')
              st.equals(locals['i16'], '-1234')
              st.equals(locals['i32'], '3455')
              st.equals(locals['i64'], '-35566')
              st.equals(locals['i128'], '-444444')
              st.equals(locals['i256'], '3434343')
              st.equals(locals['i'], '-32432423423')
              st.equals(locals['ishrink'], '2')
            })

            helper.decodeLocals(st, 177, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['ui8'], '123')
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

