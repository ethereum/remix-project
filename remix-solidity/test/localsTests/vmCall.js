'use strict'
var utileth = require('ethereumjs-util')
var Tx = require('ethereumjs-tx')
var Block = require('ethereumjs-block')
var BN = require('ethereumjs-util').BN

function sendTx (vm, from, to, value, data, cb) {
  var tx = new Tx({
    nonce: new BN(from.nonce++),
    gasPrice: new BN(1),
    gasLimit: new BN(3000000, 10),
    to: to,
    value: new BN(value, 10),
    data: new Buffer(data, 'hex')
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
  vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (error, result) {
    cb(error, utileth.bufferToHex(tx.hash()))
  })
}

module.exports = sendTx
