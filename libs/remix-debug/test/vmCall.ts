'use strict'
import { Block, BlockHeader } from '@ethereumjs/block'
import VM from '@ethereumjs/vm'
var utileth = require('ethereumjs-util')
var Tx = require('@ethereumjs/tx').Transaction
var BN = require('ethereumjs-util').BN
var remixLib = require('@remix-project/remix-lib')

function sendTx (vm, from, to, value, data, cb) {
  var tx = new Tx({
    nonce: new BN(from.nonce++),
    gasPrice: new BN(1),
    gasLimit: new BN(3000000, 10),
    to: to,
    value: new BN(value, 10),
    data: Buffer.from(data, 'hex')
  })
  tx.sign(from.privateKey)

  var header = BlockHeader.fromHeaderData({
    timestamp: new Date().getTime() / 1000 | 0,
    number: 0
  })

  var block = new Block(header, [], [])
  vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}).then(function (result) {
    setTimeout(() => {
      cb(null, utileth.bufferToHex(tx.hash()))
    }, 500)
  }).catch((error) => {
    console.error(error)
    cb(error)
  })
}

/*
  Init VM / Send Transaction
*/
function initVM (privateKey) {
  var address = utileth.privateToAddress(privateKey)
  var vm = new VM({
    activatePrecompiles: true
  })

  vm.stateManager.getAccount(address).then((account) => {    
    account.balance = new BN('f00000000000000001', 16)
    vm.stateManager.putAccount(address, account).catch((error) => {
      console.log(error)
    })
  }).catch((error) => {
    console.log(error)
  })

  var web3Provider = new remixLib.vm.Web3VMProvider()
  web3Provider.setVM(vm)
  vm.web3 = web3Provider
  return vm
}

module.exports = {
  sendTx: sendTx,
  initVM: initVM
}
