'use strict'
var tape = require('tape')
var compiler = require('solc')
var intLocal = require('./contracts/intLocal')
var TraceManager = require('../../src/trace/traceManager')
var CodeManager = require('../../src/code/codeManager')
var VM = require('ethereumjs-vm')
var Tx = require('ethereumjs-tx')
var Block = require('ethereumjs-block')
var BN = require('ethereumjs-util').BN
var utileth = require('ethereumjs-util')
var Web3Providers = require('../../src/web3Provider/web3Providers')
var traceHelper = require('../../src/helpers/traceHelper')
var util = require('../../src/helpers/global')
var LocalDecoder = require('../../src/solidity/localDecoder')

tape('solidity', function (t) {
  t.test('local decoder', function (st) {
    var privateKey = new Buffer('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
    var address = utileth.privateToAddress(privateKey)
    var vm = initVM(st, address)
    var output = compiler.compile(intLocal.contract, 0)

    sendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, output.contracts['intLocal'].bytecode, function (error, txHash) {
      if (error) {
        st.fail(error)
      } else {
        util.web3.getTransaction(txHash, function (error, tx) {
          if (error) {
            st.fail(error)
          } else {
            tx.to = traceHelper.contractCreationToken('0')
            var traceManager = new TraceManager()
            var codeManager = new CodeManager(traceManager)
            var locals = new LocalDecoder(output, codeManager, traceManager.traceAnalyser.event)
            traceManager.resolveTrace(tx, function (error, result) {
              if (error) {
                st.fail(error)
              } else {
                console.log(locals)
              }
            })
          }
        })
      }
    })
  })
})

function initVM (st, address) {
  var vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  })
  vm.stateManager.putAccountBalance(address, 'f00000000000000001', function cb () {})
  var web3Providers = new Web3Providers()
  web3Providers.addVM('VM', vm)
  web3Providers.get('VM', function (error, obj) {
    if (error) {
      var mes = 'provider TEST not defined'
      console.log(mes)
      st.fail(mes)
    } else {
      util.web3 = obj
      st.end()
    }
  })
  return vm
}

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
