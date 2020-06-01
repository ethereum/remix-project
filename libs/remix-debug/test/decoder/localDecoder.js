'use strict'
var tape = require('tape')
var compiler = require('solc')
var intLocal = require('./contracts/intLocal')
var miscLocal = require('./contracts/miscLocal')
var structArrayLocal = require('./contracts/structArrayLocal')
var remixLib = require('remix-lib')
var vmCall = require('./vmCall')
var intLocalTest = require('./localsTests/int')
var miscLocalTest = require('./localsTests/misc')
var misc2LocalTest = require('./localsTests/misc2')
var structArrayLocalTest = require('./localsTests/structArray')
var compilerInput = remixLib.helpers.compiler.compilerInput

tape('solidity', function (t) {
  t.test('local decoder', function (st) {
    var privateKey = Buffer.from('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
    var vm = vmCall.initVM(st, privateKey)
    test(st, vm, privateKey)
  })
})

function test (st, vm, privateKey) {
  var output = compiler.compile(compilerInput(intLocal.contract))
  output = JSON.parse(output)
  intLocalTest(st, vm, privateKey, output.contracts['test.sol']['intLocal'].evm.bytecode.object, output, function () {
    output = compiler.compile(compilerInput(miscLocal.contract))
    output = JSON.parse(output)
    miscLocalTest(st, vm, privateKey, output.contracts['test.sol']['miscLocal'].evm.bytecode.object, output, function () {
      output = compiler.compile(compilerInput(miscLocal.contract))
      output = JSON.parse(output)
      misc2LocalTest(st, vm, privateKey, output.contracts['test.sol']['miscLocal2'].evm.bytecode.object, output, function () {
        output = compiler.compile(compilerInput(structArrayLocal.contract))
        output = JSON.parse(output)
        structArrayLocalTest(st, vm, privateKey, output.contracts['test.sol']['structArrayLocal'].evm.bytecode.object, output, function () {
          st.end()
        })
      })
    })
  })
}
