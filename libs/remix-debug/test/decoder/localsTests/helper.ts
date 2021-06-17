'use strict'
import { solidityLocals } from '../../../src/solidity-decoder/localDecoder'

/*
  Decode local variable
*/
export function decodeLocals (st, index, traceManager, callTree, verifier) {
  try {
    traceManager.waterfall([
      function getStackAt (stepIndex, callback) {
        try {
          const result = traceManager.getStackAt(stepIndex)
          callback(null, result)
        } catch (error) {
          callback(error)
        }
      },
      function getMemoryAt (stepIndex, callback) {
        try {
          const result = traceManager.getMemoryAt(stepIndex)
          callback(null, result)
        } catch (error) {
          callback(error)
        }
      },
      function getCallDataAt (stepIndex, callback) {
        try {
          const result = traceManager.getCallDataAt(stepIndex)
          callback(null, result)
        } catch (error) {
          callback(error)
        }
      }],
      index,
      function (error, result) {
        if (error) {
          return st.fail(error)
        }
        solidityLocals(index, callTree, result[0].value, result[1].value, {}, result[2].value, { start: 5000 }, null).then((locals) => {
          verifier(locals)
        })
      })
  } catch (e) {
    st.fail(e.message)
  }
}
