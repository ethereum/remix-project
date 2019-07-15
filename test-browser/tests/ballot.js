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
    .setValue('input[placeholder="uint8 _numProposals"]', '1')
    .click('#runTabView button[class^="instanceButton"]')
    .waitForElementPresent('.instance:nth-of-type(2)')
    .click('.instance:nth-of-type(2) > div > button')
    .testFunction('delegate - transact (not payable)', '0x0571a2439ea58bd349dd130afb8aff62a33af14c06de0dbc3928519bdf13ce2e',
      `[vm]\nfrom:0xca3...a733c\nto:Ballot.delegate(address) 0x692...77b3a\nvalue:0 wei\ndata:0x5c1...4d2db\nlogs:0\nhash:0x057...3ce2e`,
      {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'}, null, null)
  },

  'Debug Ballot / delegate': function (browser) {
    browser.pause(500)
    .click('span#tx0x0571a2439ea58bd349dd130afb8aff62a33af14c06de0dbc3928519bdf13ce2e button[class^="debug"]')
    .pause(2000)
    .clickLaunchIcon('debugger')
    .click('#jumppreviousbreakpoint')
    .pause(2000)
    .goToVMTraceStep(59)
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
    .testFunction('delegate - transact (not payable)', '0xd3cd54e2f76f3993078ecf9e1b54a148def4520afc141a182293b3610bddf10f',
            `[vm]\nfrom:0xca3...a733c\nto:Ballot.delegate(address) 0x692...77b3a\nvalue:0 wei\ndata:0x5c1...4d2db\nlogs:0\nhash:0xd3c...df10f`,
            {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'}, null, null)
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
          'vote': {
            'value': '0',
            'type': 'uint8'
          },
          'delegate': {
            'value': '0x0000000000000000000000000000000000000000',
            'type': 'address'
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

var ballotABI = '[{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"_winningProposal","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"toVoter","type":"address"}],"name":"giveRightToVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"toProposal","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_numProposals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]'
