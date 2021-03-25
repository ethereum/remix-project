'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'
import examples from '../examples/example-contracts'

const sources = [
  { 'Untitled.sol': { content: examples.ballot.content } }
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Deploy Ballot': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('solidity')
      .testContracts('Untitled.sol', sources[0]['Untitled.sol'], ['Ballot'])
      .clickLaunchIcon('udapp')
      .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
      .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .click('*[data-id="universalDappUiTitleExpander"]')
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"' })
      .testFunction('last',
        {
          status: 'true Transaction mined and execution succeed',
          'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
        })
  },

  'Debug Ballot / delegate': function (browser: NightwatchBrowser) {
    browser.pause(500)
      .click('*[data-id="txLoggerDebugButton0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3"]')
      .waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
      .click('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
      .pause(2000)
      .waitForElementVisible('#stepdetail')
      .goToVMTraceStep(144)
      .checkVariableDebug('soliditystate', stateCheck)
      .checkVariableDebug('soliditylocals', localsCheck)
  },

  'Access Ballot via at address': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('udapp')
      .click('*[data-id="universalDappUiUdappClose"]')
      .addFile('ballot.abi', { content: ballotABI })
      .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3B', true, false)
      .clickLaunchIcon('fileExplorers')
      .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3A', true, true)
      .pause(500)
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .click('*[data-id="universalDappUiTitleExpander"]')
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"' })
      .testFunction('last',
        {
          status: 'false Transaction mined but execution failed',
          'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
        })
  },

  'Deploy and use Ballot using external web3': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="settingsWeb3Mode"]')
      .modalFooterOKClick()
      .clickLaunchIcon('solidity')
      .testContracts('Untitled.sol', sources[0]['Untitled.sol'], ['Ballot'])
      .clickLaunchIcon('udapp')
      .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .clickInstance(0)
      .click('*[data-id="terminalClearConsole"]')
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c' })
      .journalLastChildIncludes('Ballot.delegate(address)')
      .journalLastChildIncludes('data: 0x5c1...a733c')
      .end()
  },

  tearDown: sauce
}

const localsCheck = {
  to: {
    value: '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB',
    type: 'address'
  }
}

const stateCheck = {
  chairperson: {
    value: '0xCA35B7D915458EF540ADE6068DFE2F44E8FA733C',
    type: 'address',
    constant: false
  },
  voters: {
    value: {
      '000000000000000000000000ca35b7d915458ef540ade6068dfe2f44e8fa733c': {
        value: {
          weight: {
            value: '1',
            type: 'uint256'
          },
          voted: {
            value: false,
            type: 'bool'
          },
          delegate: {
            value: '0x0000000000000000000000000000000000000000',
            type: 'address'
          },
          vote: {
            value: '0',
            type: 'uint256'
          }
        },
        type: 'struct Ballot.Voter'
      }
    },
    type: 'mapping(address => struct Ballot.Voter)',
    constant: false
  },
  proposals: {
    value: [
      {
        value: {
          name: {
            value: '0x48656C6C6F20576F726C64210000000000000000000000000000000000000000',
            type: 'bytes32'
          },
          voteCount: {
            value: '0',
            type: 'uint256'
          }
        },
        type: 'struct Ballot.Proposal'
      }
    ],
    length: '0x1',
    type: 'struct Ballot.Proposal[]',
    constant: false
  }
}

const ballotABI = `[
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
