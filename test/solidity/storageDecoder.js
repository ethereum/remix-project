'use strict'
var tape = require('tape')
var compiler = require('solc')
var VM = require('ethereumjs-vm')
var Tx = require('ethereumjs-tx')
var Block = require('ethereumjs-block')
var ethUtil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN
var stateDecoder = require('../../src/index').solidity.stateDecoder

tape('solidity', function (t) {
  t.test('storage decoder', function (st) {
    var output = compiler.compile(intStorage, 0)
    var vm = setupVM()
    var accountPrivateKey = new Buffer('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', 'hex')
    var address = ethUtil.privateToAddress(accountPrivateKey)
    vm.stateManager.putAccountBalance(address, 'f00000000000000001', function cb () {})
    var tx = setupTransation(null, 0, output.contracts['intStorage'].bytecode)
    tx.sign(accountPrivateKey)
    executeTransaction(vm, tx, function (error, result) {
      if (error) {
        st.end(error)
      } else {
        vm.stateManager.dumpStorage(result.createdAddress, function (storage) {
          for (var k in storage) {
            if (storage[k].indexOf('a0') === 0) {
              storage[k] = storage[k].replace('a0', '0x')
            } else {
              storage[k] = '0x' + storage[k]
            }
          }
          var i = 0
          while (i < 40) {
            var strK = ethUtil.bufferToHex(ethUtil.setLengthLeft(i, 32))
            var sha3 = ethUtil.bufferToHex(ethUtil.sha3(strK)).replace('0x', '')
            if (storage[sha3]) {
              storage[strK] = storage[sha3]
            }
            i++
          }
          var decodedState = stateDecoder.solidityState(storage, output.sources, 'intStorage')
          checkDecodedState(st, decodedState)
          st.end()
        })
      }
    })
  })
})

function executeTransaction (vm, tx, cb) {
  var block = new Block({
    header: {
      timestamp: new Date().getTime() / 1000 | 0
    },
    transactions: [],
    uncleHeaders: []
  })

  vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (error, result) {
    cb(error, result)
  })
}

function setupVM () {
  var vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  })
  return vm
}

function setupTransation (to, value, data) {
  return new Tx({
    nonce: new BN(0),
    gasPrice: new BN(1),
    gasLimit: new BN(3000000, 10),
    to: to,
    value: new BN(value, 10),
    data: new Buffer(data, 'hex')
  })
}

var intStorage = `
  contract intStorage {
    uint8 ui8;
    uint16 ui16;
    uint32 ui32;
    uint64 ui64;
    uint128 ui128;
    uint256 ui256;
    uint ui;
    int8 i8;
    int16 i16;
    int32 i32;
    int64 i64;
    int128 i128;
    int256 i256;
    int i;
    
    function intStorage () {
      ui8 = 0;
      ui16 = 0;
      ui32 = 0;
      ui64 = 0;
      ui128 = 2;
      ui256 = 0;
      ui = 0;
      i8 = 0;
      i16 = 0;
      i32 = 0;
      i64 = 0;
      i128 = 0;
      i256 = 0;
      i = 0;
    }
  }
`

function checkDecodedState (st, decoded) {
  console.log(JSON.stringify(decoded))
  st.equal(decoded['ui8'], '123')
  st.equal(decoded['ui16'], '354')
  st.equal(decoded['ui32'], '1000')
  st.equal(decoded['ui64'], '23456')
  st.equal(decoded['ui128'], '234567')
  st.equal(decoded['ui256'], '1234566778')
  st.equal(decoded['ui'], '123545666')

  st.equal(decoded['i8'], '45')
  st.equal(decoded['i16'], '1234')
  st.equal(decoded['i32'], '3455')
  st.equal(decoded['i64'], '-35566')
  st.equal(decoded['i128'], '-444444')
  st.equal(decoded['i256'], '3434343')
  st.equal(decoded['i'], '-32432423423')
}

/*
function intStorage () {
      ui8 = 0;
      ui16 = 0;
      ui32 = 0;
      ui64 = 0;
      ui128 = 234567;
      ui256 = 0;
      ui = 123545666;
      i8 = -45;
      i16 = -1234;
      i32 = 3455;
      i64 = -35566;
      i128 = -444444;
      i256 = 3434343;
      i = -32432423423;
    }
    */
