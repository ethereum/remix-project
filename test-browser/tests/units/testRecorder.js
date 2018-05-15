'use strict'
var contractHelper = require('../../helpers/contracts')

module.exports = {
  '@disabled': true, // run by compiling.j
  '@sources': function () {
    return sources
  },
  test: function (browser, callback) {
    contractHelper.addFile(browser, 'scenario.json', {content: records}, () => {
      browser
        .click('.runView')
        .click('div[class^="cardContainer"] i[class^="arrow"]')
        .click('#runTabView .runtransaction')
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2)')
        .waitForElementPresent('.instance:nth-of-type(3)')
        .click('.instance:nth-of-type(3)')
        .clickFunction('getInt - call')
        .clickFunction('getAddress - call')
        .clickFunction('getFromLib - call')
        .waitForElementPresent('div[class^="contractActionsContainer"] div[class^="value"] ul')
        .perform((client, done) => {
          contractHelper.verifyCallReturnValue(browser, '0x35ef07393b57464e93deb59175ff72e6499450cf', ['0: uint256: 1', '0: uint256: 3456', '0: address: 0x35eF07393b57464e93dEB59175fF72E6499450cF'], () => {
            done()
          })
        })
        .click('i[class^="clearinstance"]')
        .perform((client, done) => {
          contractHelper.testContracts(browser, 'testRecorder.sol', sources[0]['browser/testRecorder.sol'], ['testRecorder'], function () {
            done()
          })
        })
        .perform((client, done) => {
          contractHelper.createContract(browser, '12', function () {
            done()
          })
        })
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2)')
        .perform((client, done) => {
          browser.clickFunction('set - transact (not payable)', {types: 'uint256 _p', values: '34'})
              .click('i.savetransaction').modalFooterOKClick().getEditorValue(function (result) {
                var parsed = JSON.parse(result)
                browser.assert.equal(JSON.stringify(parsed.transactions[0].record.parameters), JSON.stringify(scenario.transactions[0].record.parameters))
                browser.assert.equal(JSON.stringify(parsed.transactions[0].record.name), JSON.stringify(scenario.transactions[0].record.name))
                browser.assert.equal(JSON.stringify(parsed.transactions[0].record.type), JSON.stringify(scenario.transactions[0].record.type))
                browser.assert.equal(JSON.stringify(parsed.transactions[0].record.from), JSON.stringify(scenario.transactions[0].record.from))
                browser.assert.equal(JSON.stringify(parsed.transactions[0].record.contractName), JSON.stringify(scenario.transactions[0].record.contractName))

                browser.assert.equal(JSON.stringify(parsed.transactions[1].record.parameters), JSON.stringify(scenario.transactions[1].record.parameters))
                browser.assert.equal(JSON.stringify(parsed.transactions[1].record.name), JSON.stringify(scenario.transactions[1].record.name))
                browser.assert.equal(JSON.stringify(parsed.transactions[1].record.type), JSON.stringify(scenario.transactions[1].record.type))
                browser.assert.equal(JSON.stringify(parsed.transactions[1].record.from), JSON.stringify(scenario.transactions[1].record.from))
                done()
              })
        }).perform(() => {
          callback()
        })
    })
  }
}

var sources = [{'browser/testRecorder.sol': {content: `pragma solidity ^0.4.0;contract testRecorder {
    function testRecorder(uint p) {
        
    }
    function set (uint _p) {
            
    }
}`}}]

var records = `{
  "accounts": {
    "account{0}": "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
  },
  "linkReferences": {
    "testLib": "created{1512830014773}"
  },
  "transactions": [
    {
      "timestamp": 1512830014773,
      "record": {
        "value": "0",
        "parameters": [],
        "abi": "0xbc36789e7a1e281436464229828f817d6612f7b477d66591ff96a9e064bcc98a",
        "contractName": "testLib",
        "bytecode": "60606040523415600e57600080fd5b60968061001c6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636d4ce63c146044575b600080fd5b604a6060565b6040518082815260200191505060405180910390f35b6000610d809050905600a165627a7a7230582022d123b15248b8176151f8d45c2dc132063bcc9bb8d5cd652aea7efae362c8050029",
        "linkReferences": {},
        "type": "constructor",
        "from": "account{0}"
      }
    },
    {
      "timestamp": 1512830015080,
      "record": {
        "value": "100",
        "parameters": [
          11
        ],
        "abi": "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec",
        "contractName": "test",
        "bytecode": "60606040526040516020806102b183398101604052808051906020019091905050806000819055505061027a806100376000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632f30c6f61461006757806338cc48311461009e57806362738998146100f357806387cc10e11461011c575b600080fd5b61009c600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610145565b005b34156100a957600080fd5b6100b1610191565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100fe57600080fd5b6101066101bb565b6040518082815260200191505060405180910390f35b341561012757600080fd5b61012f6101c4565b6040518082815260200191505060405180910390f35b8160008190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008054905090565b600073__browser/ballot.sol:testLib____________636d4ce63c6000604051602001526040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160206040518083038186803b151561022e57600080fd5b6102c65a03f4151561023f57600080fd5b505050604051805190509050905600a165627a7a72305820e0b2510bb2890a0334bfe5613d96db3e72442e63b514cdeaee8fc2c6bbd19d3a0029",
        "linkReferences": {
          "browser/ballot.sol": {
            "testLib": [
              {
                "length": 20,
                "start": 511
              }
            ]
          }
        },
        "name": "",
        "type": "constructor",
        "from": "account{0}"
      }
    },
    {
      "timestamp": 1512830034180,
      "record": {
        "value": "1000000000000000000",
        "parameters": [
          1,
          "created{1512830015080}"
        ],
        "to": "created{1512830015080}",
        "abi": "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec",
        "name": "set",
        "type": "function",
        "from": "account{0}"
      }
    }
  ],
  "abis": {
    "0xbc36789e7a1e281436464229828f817d6612f7b477d66591ff96a9e064bcc98a": [
      {
        "constant": true,
        "inputs": [],
        "name": "get",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec": [
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
        "name": "getFromLib",
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
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_r",
            "type": "uint256"
          }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "constructor"
      }
    ]
  }
}`

var scenario = {
  'accounts': {
    'account{0}': '0xca35b7d915458ef540ade6068dfe2f44e8fa733c'
  },
  'linkReferences': {},
  'transactions': [
    {
      'timestamp': 1512912691086,
      'record': {
        'value': '0',
        'parameters': [
          "12" // eslint-disable-line
        ],
        'abi': '0x54a8c0ab653c15bfb48b47fd011ba2b9617af01cb45cab344acd57c924d56798',
        'contractName': 'testRecorder',
        'bytecode': '6060604052341561000f57600080fd5b6040516020806100cd833981016040528080519060200190919050505060938061003a6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b1146044575b600080fd5b3415604e57600080fd5b606260048080359060200190919050506064565b005b505600a165627a7a723058204839660366b94f5f3c8c6da233a2c5fe95ad5635b5c8a2bb630a8b845d68ecdd0029',
        'linkReferences': {},
        'name': '',
        'type': 'constructor',
        'from': 'account{0}'
      }
    },
    {
      'timestamp': 1512912696128,
      'record': {
        'value': '0',
        'parameters': [
          "34" // eslint-disable-line
        ],
        'to': 'created{1512912691086}',
        'abi': '0x54a8c0ab653c15bfb48b47fd011ba2b9617af01cb45cab344acd57c924d56798',
        'name': 'set',
        'type': 'function',
        'from': 'account{0}'
      }
    }
  ],
  'abis': {
    '0x54a8c0ab653c15bfb48b47fd011ba2b9617af01cb45cab344acd57c924d56798': [
      {
        'constant': false,
        'inputs': [
          {
            'name': '_p',
            'type': 'uint256'
          }
        ],
        'name': 'set',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'name': 'p',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'constructor'
      }
    ]
  }
}
