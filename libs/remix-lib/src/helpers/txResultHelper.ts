'use strict'
import { bytesToHex } from '@ethereumjs/util'
import { isHexString } from 'ethjs-util'

function convertToPrefixedHex (input) {
  if (input === undefined || input === null || isHexString(input)) {
    return input
  } else if (Buffer.isBuffer(input)) {
    return bytesToHex(input)
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
export function resultToRemixTx (txResult, execResult?) {
  const { receipt, transactionHash, result } = txResult
  const { status, gasUsed, contractAddress } = receipt
  let returnValue, errorMessage

  if (isHexString(result)) {
    returnValue = result
  } else if (execResult !== undefined) {
    returnValue = execResult.returnValue
    errorMessage = execResult.exceptionError
  }

  console.log('resultToRemixTx', returnValue)
  return {
    transactionHash,
    status,
    gasUsed: bytesToHex(gasUsed),
    error: errorMessage,
    return: returnValue ? bytesToHex(returnValue) : '0x0',
    createdAddress: bytesToHex(contractAddress)
  }
}
