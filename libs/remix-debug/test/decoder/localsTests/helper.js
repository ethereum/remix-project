'use strict'
var localDecoder = require('../../../src/solidity-decoder/localDecoder')

/*
  Decode local variable
*/
function decodeLocal (st, index, traceManager, callTree, verifier) {
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
      }],
      index,
      function (error, result) {
        if (error) {
          return st.fail(error)
        }
        localDecoder.solidityLocals(index, callTree, result[0].value, result[1].value, {}, { start: 5000 }).then((locals) => {
          verifier(locals)
        })
      })
  } catch (e) {
    st.fail(e.message)
  }
}

module.exports = {
  decodeLocals: decodeLocal
}
