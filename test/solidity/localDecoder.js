'use strict'
var tape = require('tape')
var compiler = require('solc')
var intLocal = require('./contracts/intLocal')
var miscLocal = require('./contracts/miscLocal')
var structArrayLocal = require('./contracts/structArrayLocal')
var VM = require('ethereumjs-vm')
var utileth = require('ethereumjs-util')
var Web3Providers = require('../../src/web3Provider/web3Providers')
var util = require('../../src/helpers/global')
var intLocalTest = require('./localsTests/int')
var miscLocalTest = require('./localsTests/misc')
var misc2LocalTest = require('./localsTests/misc2')
var structArrayLocalTest = require('./localsTests/structArray')

tape('solidity', function (t) {
  t.test('local decoder', function (st) {
    var privateKey = new Buffer('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
    var address = utileth.privateToAddress(privateKey)
    var vm = initVM(st, address)
    test(st, vm, privateKey)
  })
})

/*
  Init VM / Send Transaction
*/
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

function test (st, vm, privateKey) {
  var output = compiler.compile(intLocal.contract, 0)
  intLocalTest(st, vm, privateKey, output.contracts[':intLocal'].bytecode, output, function () {
    output = compiler.compile(miscLocal.contract, 0)
    miscLocalTest(st, vm, privateKey, output.contracts[':miscLocal'].bytecode, output, function () {
      output = compiler.compile(miscLocal.contract, 0)
      misc2LocalTest(st, vm, privateKey, output.contracts[':miscLocal2'].bytecode, output, function () {
        output = compiler.compile(structArrayLocal.contract, 0)
        structArrayLocalTest(st, vm, privateKey, output.contracts[':structArrayLocal'].bytecode, output, function () {})
      })
    })
  })
}
