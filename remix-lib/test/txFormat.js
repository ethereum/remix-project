'use strict'
var tape = require('tape')
var txFormat = require('../src/execution/txFormat')
var compiler = require('solc')
var compilerInput = require('../src/helpers/compilerHelper').compilerInput

var context
tape('ContractParameters - (TxFormat.buildData)', function (t) {
  var output = compiler.compileStandardWrapper(compilerInput(uintContract))
  output = JSON.parse(output)
  var contract = output.contracts['test.sol']['uintContractTest']
  var udapp = { runTx: () => {} } // fake
  context = { output, contract, udapp }
  var bytecode = '6060604052341561000f57600080fd5b6101058061001e6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634b521953146044575b600080fd5b3415604e57600080fd5b608a600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050608c565b005b8260008190555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050505600a165627a7a72305820e2f31aca91b90c01fe46fd2de5b3788ba02f577f9858e6aae48800e29db122670029'
  t.test('(TxFormat.buildData)', function (st) {
    st.plan(3)
    testWithInput(st, '123123, "0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8", "34"', bytecode + '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000022')
    testWithInput(st, '"123123" , 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8,   654   ', bytecode + '000000000000000000000000000000000000000000000000000000000001e0f3000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea8000000000000000000000000000000000000000000000000000000000000028e')
    // parsing this as javascript number should overflow
    testWithInput(st, '90071992547409910000, 0xf7a10e525d4b168f45f74db1b61f63d3e7619ea8, 0', bytecode + '000000000000000000000000000000000000000000000004e1ffffffffffd8f0000000000000000000000000f7a10e525d4b168f45f74db1b61f63d3e7619ea80000000000000000000000000000000000000000000000000000000000000000')
  })
})

function testWithInput (st, params, expected) {
  txFormat.buildData('uintContractTest', context.contract, context.output.contracts, true, context.contract.abi[0], params, context.udapp
    , (error, data) => {
      if (error) { return st.fails(error) }
      console.log(data)
      st.equal(data.dataHex, expected)
    }, () => {})
}

var uintContract = `contract uintContractTest {
    uint _tp;
    address _ap;
    function test(uint _t, address _a, uint _i) {
        _tp = _t;
        _ap = _a;
    }
}`
