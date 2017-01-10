'use strict'
var localDecoder = require('../../../babelify-src/solidity/localDecoder')

/*
  Decode local variable
*/
function decodeLocal (st, index, traceManager, callTree, verifier) {
  try {
    traceManager.waterfall([
      traceManager.getStackAt,
      traceManager.getMemoryAt],
      index,
      function (error, result) {
        if (!error) {
          var locals = localDecoder.solidityLocals(index, callTree, result[0].value, result[1].value)
          verifier(locals)
        } else {
          st.fail(error)
        }
      })
  } catch (e) {
    st.fail(e.message)
  }
}

module.exports = {
  decodeLocals: decodeLocal
}
