'use strict'

const tape = require('tape')
const { BN, toBuffer } = require('ethereumjs-util')

const { resultToRemixTx } = require('../src/helpers/txResultHelper')

const TRANSACTION_HASH = '0x538ad944d09c2df403f064c1e4556fae877fe3f1b600c567622e330c2bdbbe2e'
const CONTRACT_ADDRESS_HEX = '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
const CONTRACT_ADDRESS_BUFFER = toBuffer(
  [105, 42, 112, 210, 228, 36, 165, 109, 44, 108, 39, 170, 151, 209, 168,
    99, 149, 135, 123, 58])
const RETURN_VALUE_HEX = '0x0000000000000000000000000000000000000000000000000000000000000001'
const RETURN_VALUE_BUFFER = toBuffer(
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1])
const STATUS_OK = '0x1'
const GAS_USED_INT = 75427
const GAS_USED_HEX = '0x126a3'

const NODE_CALL_RESULT = {
  result: RETURN_VALUE_HEX,
  transactionHash: undefined
}

const NODE_TX_RESULT = {
  result: {
    blockHash: '0x380485a4e6372a42e36489783c7f7cb66257612133cd245859c206fd476e9c44',
    blockNumber: 5994,
    contractAddress: CONTRACT_ADDRESS_HEX,
    cumulativeGasUsed: GAS_USED_INT,
    from: '0xed9d02e382b34818e88b88a309c7fe71e65f419d',
    gasUsed: GAS_USED_INT,
    status: STATUS_OK,
    to: null,
    transactionHash: TRANSACTION_HASH,
    transactionIndex: 0
  },
  transactionHash: TRANSACTION_HASH
}

const VM_RESULT = {
  result: {
    amountSpent: new BN(1),
    createdAddress: CONTRACT_ADDRESS_BUFFER,
    gasRefund: new BN(0),
    gasUsed: new BN(GAS_USED_INT),
    status: STATUS_OK,
    vm: {
      exception: 1,
      exceptionError: null,
      gasRefund: new BN(0),
      gasUsed: new BN(GAS_USED_INT),
      return: RETURN_VALUE_BUFFER
    }
  },
  transactionHash: TRANSACTION_HASH
}

tape('converts node transaction result to RemixTx', function (t) {
  // contract creation
  let txResult = { ...NODE_TX_RESULT }
  let remixTx = resultToRemixTx(txResult)

  t.equal(remixTx.transactionHash, TRANSACTION_HASH)
  t.equal(remixTx.createdAddress, CONTRACT_ADDRESS_HEX)
  t.equal(remixTx.status, STATUS_OK)
  t.equal(remixTx.gasUsed, GAS_USED_HEX)
  t.equal(remixTx.return, undefined)
  t.equal(remixTx.error, undefined)

  // contract method tx
  txResult.result.contractAddress = null
  remixTx = resultToRemixTx(txResult)
  t.equal(remixTx.createdAddress, null)

  t.end()
})

tape('converts node call result to RemixTx', function (t) {
  let txResult = { ...NODE_CALL_RESULT }
  let remixTx = resultToRemixTx(txResult)

  t.equal(remixTx.transactionHash, undefined)
  t.equal(remixTx.createdAddress, undefined)
  t.equal(remixTx.status, undefined)
  t.equal(remixTx.gasUsed, undefined)
  t.equal(remixTx.return, RETURN_VALUE_HEX)
  t.equal(remixTx.error, undefined)

  t.end()
})

tape('converts VM result to RemixTx', function (t) {
  let txResult = { ...VM_RESULT }
  let remixTx = resultToRemixTx(txResult)

  t.equal(remixTx.transactionHash,
    TRANSACTION_HASH)
  t.equal(remixTx.createdAddress, CONTRACT_ADDRESS_HEX)
  t.equal(remixTx.status, STATUS_OK)
  t.equal(remixTx.gasUsed, GAS_USED_HEX)
  t.equal(remixTx.return, RETURN_VALUE_HEX)
  t.equal(remixTx.error, null)

  txResult.result.vm.exception = 0
  txResult.result.vm.exceptionError = 'this is an error'
  remixTx = resultToRemixTx(txResult)
  t.equal(remixTx.error, 'this is an error')

  t.end()
})
