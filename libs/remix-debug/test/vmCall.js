'use strict'
var utileth = require('ethereumjs-util')
var Tx = require('ethereumjs-tx').Transaction
var Block = require('ethereumjs-block')
var BN = require('ethereumjs-util').BN
var remixLib = require('remix-lib')

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
  var Web3Providers = remixLib.vm.Web3Providers
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

  var web3Providers = new Web3Providers()
  web3Providers.addVM('VM', vm)
  web3Providers.get('VM', function (error, obj) {
    if (error) {
      var mes = 'provider TEST not defined'
      console.log(mes)
    } else {
      vm.web3 = obj
    }
  })
  return vm
}

module.exports = {
  sendTx: sendTx,
  initVM: initVM
}
