'use strict'
var examples = require('../../src/app/editor/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = [
  {'browser/Untitled.sol': {content: examples.ballot.content}}
]

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Deploy Ballot': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
    .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
    .click('#runTabView button[class^="instanceButton"]')
    .waitForElementPresent('.instance:nth-of-type(2)')
    .click('.instance:nth-of-type(2) > div > button')
    .testFunction('delegate - transact (not payable)', '0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3',
      `[vm]\nfrom:0xca3...a733c\nto:Ballot.delegate(address) 0x692...77b3a\nvalue:0 wei\ndata:0x5c1...4d2db\nlogs:0\nhash:0x41f...c31b3`,
      {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'}, null, null)
  },

  'Debug Ballot / delegate': function (browser) {
    browser.pause(500)
    .click('span#tx0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3 button[class^="debug"]')
    .pause(2000)
    .clickLaunchIcon('debugger')
    .click('#jumppreviousbreakpoint')
    .pause(2000)
    .goToVMTraceStep(79)
    .pause(1000)
    .checkVariableDebug('soliditystate', stateCheck)
    .checkVariableDebug('soliditylocals', localsCheck)
  },

  'Access Ballot via at address': function (browser) {
    browser.clickLaunchIcon('udapp')
    .click('button[class^="udappClose"]')
    .addFile('ballot.abi', { content: ballotABI })
    .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3B', true, false)
    .clickLaunchIcon('fileExplorers')
    .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3A', true, true)
    .pause(500)
    .waitForElementPresent('.instance:nth-of-type(2)')
    .click('.instance:nth-of-type(2) > div > button')
    .testFunction('delegate - transact (not payable)', '0xca58080c8099429caeeffe43b8104df919c2c543dceb9edf9242fa55f045c803',
            `[vm]\nfrom:0xca3...a733c\nto:Ballot.delegate(address) 0x692...77b3a\nvalue:0 wei\ndata:0x5c1...4d2db\nlogs:0\nhash:0xca5...5c803`,
            {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'}, null, null)
  },

  'Deploy and use Ballot using external web3': function (browser) {
    browser
    .click('#selectExEnvOptions #web3-mode')
    .modalFooterOKClick()
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
    .click('#runTabView button[class^="instanceButton"]')
    .clickInstance(0)
    .click('#clearConsole')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c'})
    .journalLastChildIncludes('Ballot.delegate(address)')
    .journalLastChildIncludes('data:0x5c1...a733c')
    .end()
  },

  tearDown: sauce
}

var localsCheck = {
  'to': {
    'value': '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB',
    'type': 'address'
  }
}

var stateCheck = {
  'chairperson': {
    'value': '0xCA35B7D915458EF540ADE6068DFE2F44E8FA733C',
    'type': 'address',
    'constant': false
  },
  'voters': {
    'value': {
      '000000000000000000000000ca35b7d915458ef540ade6068dfe2f44e8fa733c': {
        'value': {
          'weight': {
            'value': '1',
            'type': 'uint256'
          },
          'voted': {
            'value': false,
            'type': 'bool'
          },
          'delegate': {
            'value': '0x0000000000000000000000000000000000000000',
            'type': 'address'
          },
          'vote': {
            'value': '0',
            'type': 'uint256'
          }
        },
        'type': 'struct Ballot.Voter'
      }
    },
    'type': 'mapping(address => struct Ballot.Voter)',
    'constant': false
  },
  'proposals': {
    'value': [
      {
        'value': {
          'name': {
            'value': '0x48656C6C6F20576F726C64210000000000000000000000000000000000000000',
            'type': 'bytes32'
          },
          'voteCount': {
            'value': '0',
            'type': 'uint256'
          }
        },
        'type': 'struct Ballot.Proposal'
      }
    ],
    'length': '0x1',
    'type': 'struct Ballot.Proposal[]',
    'constant': false
  }
}

var ballotABI = `[
{
  "inputs": [
    {
      "internalType": "bytes32[]",
      "name": "proposalNames",
      "type": "bytes32[]"
    }
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "constant": true,
  "inputs": [],
  "name": "chairperson",
  "outputs": [
    {
      "internalType": "address",
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
      "internalType": "address",
      "name": "to",
      "type": "address"
    }
  ],
  "name": "delegate",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "constant": false,
  "inputs": [
    {
      "internalType": "address",
      "name": "voter",
      "type": "address"
    }
  ],
  "name": "giveRightToVote",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "constant": true,
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "proposals",
  "outputs": [
    {
      "internalType": "bytes32",
      "name": "name",
      "type": "bytes32"
    },
    {
      "internalType": "uint256",
      "name": "voteCount",
      "type": "uint256"
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
      "internalType": "uint256",
      "name": "proposal",
      "type": "uint256"
    }
  ],
  "name": "vote",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "constant": true,
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "voters",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "weight",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "voted",
      "type": "bool"
    },
    {
      "internalType": "address",
      "name": "delegate",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "vote",
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
  "name": "winnerName",
  "outputs": [
    {
      "internalType": "bytes32",
      "name": "winnerName_",
      "type": "bytes32"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
},
{
  "constant": true,
  "inputs": [],
  "name": "winningProposal",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "winningProposal_",
      "type": "uint256"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}
]`
