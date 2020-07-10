'use strict'
var localDecoder = require('../../../src/solidity-decoder/localDecoder')

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
          localDecoder.solidityLocals(index, callTree, result[0].value, result[1].value, {}, {start: 5000}).then((locals) => {
            verifier(locals)
          })
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
