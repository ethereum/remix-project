'use strict'
var contractHelper = require('../../helpers/contracts')

module.exports = function (browser, callback) {
  contractHelper.addFile(browser, 'scenario.json', {content: records}, () => {
    browser
    .click('.runView')
    .click('#runTabView .runtransaction')
    .clickFunction('getInt - call')
    .clickFunction('getAddress - call')
    .waitForElementPresent('div[class^="contractProperty"] div[class^="value"]')
    .perform(() => {
      contractHelper.verifyCallReturnValue(browser, '0xec5bee2dbb67da8757091ad3d9526ba3ed2e2137', ['0: uint256: 1', '0: address: 0xca35b7d915458ef540ade6068dfe2f44e8fa733c'], () => { callback() })
    })
  })
}

var records = `{
  "accounts": {
    "account{0}": "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
  },
  "transactions": [
    {
      "timestamp": 1512661974836,
      "record": {
        "value": "0",
        "parameters": [
          23
        ],
        "abi": "0xe8e77626586f73b955364c7b4bbf0bb7f7685ebd40e852b164633a4acbd3244c",
        "contractName": "test",
        "bytecode": "6060604052341561000f57600080fd5b6040516020806102098339810160405280805190602001909190505080600081905550506101c7806100426000396000f300606060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632f30c6f61461005c57806338cc48311461009e57806362738998146100f3575b600080fd5b341561006757600080fd5b61009c600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061011c565b005b34156100a957600080fd5b6100b1610168565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100fe57600080fd5b610106610192565b6040518082815260200191505060405180910390f35b8160008190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600080549050905600a165627a7a7230582021de204df5493bae860efacfbdea0118cbb3d73760ad48ee0838d07d37fe3c9e0029",
        "linkReferences": {},
        "name": "",
        "type": "constructor",
        "from": "account{0}"
      }
    },
    {
      "timestamp": 1512661987446,
      "record": {
        "value": "0",
        "parameters": [
          1,
          "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
        ],
        "to": "created-contract{1512661974836}",
        "abi": "0xe8e77626586f73b955364c7b4bbf0bb7f7685ebd40e852b164633a4acbd3244c",
        "name": "set",
        "type": "function",
        "from": "account{0}"
      }
    }
  ],
  "linkReferences": {},
  "abis": {
    "0xe8e77626586f73b955364c7b4bbf0bb7f7685ebd40e852b164633a4acbd3244c": [
      {
        "constant": true,
        "inputs": [],
        "name": "getInt",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getAddress",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_t",
            "type": "uint256"
          },
          {
            "name": "_add",
            "type": "address"
          }
        ],
        "name": "set",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_r",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ]
  }
}`
