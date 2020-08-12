'use strict'
var utileth = require('ethereumjs-util')
var Tx = require('ethereumjs-tx').Transaction
var Block = require('ethereumjs-block')
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
  var block = new Block({
    header: {
      timestamp: new Date().getTime() / 1000 | 0,
      number: 0
    },
    transactions: [],
    uncleHeaders: []
  })
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
  var VM = require('ethereumjs-vm').default
  var address = utileth.privateToAddress(privateKey)
  var vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  })

  vm.stateManager.getAccount(address, (error, account) => {
    if (error) return console.log(error)
    account.balance = '0xf00000000000000001'
    vm.stateManager.putAccount(address, account, function cb (error) {
      if (error) console.log(error)
    })
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
