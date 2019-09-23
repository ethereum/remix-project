'use strict'
const { bufferToHex, isHexString } = require('ethereumjs-util')

function convertToPrefixedHex (input) {
  if (input === undefined || input === null || isHexString(input)) {
    return input
  } else if (Buffer.isBuffer(input)) {
    return bufferToHex(input)
  }
  return '0x' + input.toString(16)
}

/*
 txResult.result can be 3 different things:
 - VM call or tx: ethereumjs-vm result object
 - Node transaction: object returned from eth.getTransactionReceipt()
 - Node call: return value from function call (not an object)

 Also, VM results use BN and Buffers, Node results use hex strings/ints,
 So we need to normalize the values to prefixed hex strings
*/
function resultToRemixTx (txResult) {
  const { result, transactionHash } = txResult
  const { status, vm, gasUsed, createdAddress, contractAddress } = result
  let returnValue, errorMessage

  if (isHexString(result)) {
    returnValue = result
  } else if (vm !== undefined) {
    returnValue = vm.return
    errorMessage = vm.exceptionError
  }

  return {
    transactionHash,
    status,
    gasUsed: convertToPrefixedHex(gasUsed),
    error: errorMessage,
    return: convertToPrefixedHex(returnValue),
    createdAddress: convertToPrefixedHex(createdAddress || contractAddress)
  }
}

module.exports = {
  resultToRemixTx
}
