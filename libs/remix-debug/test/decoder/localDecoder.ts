'use strict'
import tape from 'tape'
var compiler = require('solc')
var intLocal = require('./contracts/intLocal')
var miscLocal = require('./contracts/miscLocal')
var structArrayLocal = require('./contracts/structArrayLocal')
var calldataLocal = require('./contracts/calldata')
var vmCall = require('./vmCall')
var intLocalTest = require('./localsTests/int')
var miscLocalTest = require('./localsTests/misc')
var misc2LocalTest = require('./localsTests/misc2')
var structArrayLocalTest = require('./localsTests/structArray')
var calldataLocalTest = require('./localsTests/calldata')
var compilerInput = require('../helpers/compilerHelper').compilerInput

tape('solidity', function (t) {
  t.test('local decoder', async function (st) {
    var privateKey = Buffer.from('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
    var vm = await vmCall.initVM(st, privateKey)
    await test(st, vm, privateKey)
  })
})

async function test (st, vm, privateKey) {
  var output = compiler.compile(compilerInput(intLocal.contract))
  output = JSON.parse(output)
  await intLocalTest(st, vm, privateKey, output.contracts['test.sol']['intLocal'].evm.bytecode.object, output)
  output = compiler.compile(compilerInput(miscLocal.contract))
  output = JSON.parse(output)
  await miscLocalTest(st, vm, privateKey, output.contracts['test.sol']['miscLocal'].evm.bytecode.object, output)
  output = compiler.compile(compilerInput(miscLocal.contract))
  output = JSON.parse(output)
  await misc2LocalTest(st, vm, privateKey, output.contracts['test.sol']['miscLocal2'].evm.bytecode.object, output)
  output = compiler.compile(compilerInput(structArrayLocal.contract))
  output = JSON.parse(output)
  await structArrayLocalTest(st, vm, privateKey, output.contracts['test.sol']['structArrayLocal'].evm.bytecode.object, output)

  output = compiler.compile(compilerInput(calldataLocal.contract))
  output = JSON.parse(output)
  await calldataLocalTest(st, vm, privateKey, output.contracts['test.sol']['calldataLocal'].evm.bytecode.object, output)

  st.end()
}
