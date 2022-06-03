'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
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
      .clickInstance(0)
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"' })
      .testFunction('last',
        {
          status: 'true Transaction mined and execution succeed',
          'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
        })
  },

  'Call method from Ballot to check return value': function (browser: NightwatchBrowser) {
    browser
      .clickFunction('winnerName - call')
      // Test in terminal
      .testFunction('last',
        {
          to: 'Ballot.winnerName() 0x692a70D2e424a56D2C6C27aA97D1a86395877b3A',
          'decoded output': { 0: 'bytes32: winnerName_ 0x48656c6c6f20576f726c64210000000000000000000000000000000000000000' }
        })
      // Test in Udapp UI , treeViewDiv0 shows returned value on method click
      .assert.containsText('*[data-id="treeViewDiv0"]', 'bytes32: winnerName_ 0x48656c6c6f20576f726c64210000000000000000000000000000000000000000')
  },

  'Debug Ballot / delegate': function (browser: NightwatchBrowser) {
    browser.pause(500)
      .debugTransaction(1)
      .waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
      .click('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
      .pause(2000)
      .waitForElementVisible('#stepdetail')
      .goToVMTraceStep(144)
      .pause(2000)
      .checkVariableDebug('soliditystate', stateCheck)
      .checkVariableDebug('soliditylocals', localsCheck)
  },

  'Access Ballot via at address': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('udapp')
      .click('*[data-id="universalDappUiUdappClose"]')
      .addFile('ballot.abi', { content: ballotABI })
      // we are not changing the visibility for not checksumed contracts
      // .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3B', true, false)
      .clickLaunchIcon('filePanel')
      .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3A', true, true)
      .pause(500)
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .clickInstance(0)
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"' })
      .testFunction('last',
        {
          status: 'false Transaction mined but execution failed',
          'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
        })
  },

  'Deploy and use Ballot using external web3': function (browser: NightwatchBrowser) {
    browser
      .openFile('Untitled.sol')
      .clickLaunchIcon('udapp')
      .click('*[data-id="settingsWeb3Mode"]')
      .waitForElementPresent('[data-id="envNotification-modal-footer-ok-react"]')
      .execute(function () {
        const modal = document.querySelector('[data-id="envNotification-modal-footer-ok-react"]') as any

        modal.click()
      })
      .pause(5000)
      .execute(function () {
        const env: any = document.getElementById('selectExEnvOptions')

        return env.value
      }, [], function (result) {
        browser.assert.ok(result.value === 'web3', 'Web3 Provider not selected')
      })
      .clickLaunchIcon('solidity')
      .clickLaunchIcon('udapp')
      .pause(2000)
      .clearValue('input[placeholder="bytes32[] proposalNames"]')
      .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .clickInstance(0)
      .click('*[data-id="terminalClearConsole"]')
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c' })
      .journalLastChildIncludes('Ballot.delegate(address)')
      .journalLastChildIncludes('data: 0x5c1...a733c')
  },

  'Call method from Ballot to check return value using external web3': function (browser: NightwatchBrowser) {
    browser
      .clickFunction('winnerName - call')
      // Test in terminal
      .journalLastChildIncludes('Ballot.winnerName()')
      .testFunction('last',
        {
          'decoded output': { 0: 'bytes32: winnerName_ 0x48656c6c6f20576f726c64210000000000000000000000000000000000000000' }
        })
      // Test in Udapp UI , treeViewDiv0 shows returned value on method click
      .assert.containsText('*[data-id="treeViewDiv0"]', 'bytes32: winnerName_ 0x48656c6c6f20576f726c64210000000000000000000000000000000000000000')
  },

  'Compile Ballot using config file': function (browser: NightwatchBrowser) {
    browser
      .addFile('cf.json', {content: configFile})
      .clickLaunchIcon('solidity')
      .waitForElementVisible('*[data-id="scConfigExpander"]')
      .click('*[data-id="scConfigExpander"]')
      .waitForElementVisible('*[data-id="scFileConfiguration"]', 10000)
      .click('*[data-id="scFileConfiguration"]')
      .waitForElementVisible('*[data-id="scConfigChangeFilePath"]', 10000)
      .click('*[data-id="scConfigChangeFilePath"]')
      .waitForElementVisible('*[data-id="scConfigFilePathInput"]', 10000)
      .clearValue('*[data-id="scConfigFilePathInput"]')
      .setValue('*[data-id="scConfigFilePathInput"]', 'cf.json')
      .sendKeys('*[data-id$="scConfigFilePathInput"]', browser.Keys.ENTER)
      .openFile('Untitled.sol')
      .verifyContracts(['Ballot'], {wait: 2000, runs: '300'})
      .end()
  }
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
    constant: false,
    immutable: false
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
    constant: false,
    immutable: false
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
    constant: false,
    immutable: false
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

const configFile = `
{
	"language": "Solidity",
	"settings": {
		"optimizer": {
			"enabled": true,
			"runs": 300
		},
		"outputSelection": {
			"*": {
			"": ["ast"],
      "*": ["abi", "metadata", "devdoc", "userdoc", "storageLayout", "evm.legacyAssembly", "evm.bytecode", "evm.deployedBytecode", "evm.methodIdentifiers", "evm.gasEstimates", "evm.assembly"]
			}
		},
		"evmVersion": "byzantium"
	}
}
`