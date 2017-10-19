'use strict'
var contractHelper = require('../helpers/contracts')
var examples = require('../../src/app/editor/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = [
  {'browser/Untitled.sol': examples.ballot.content}
]

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Ballot': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser, testData) {
  browser.testFunction = contractHelper.testFunction
  browser
    .waitForElementVisible('.newFile', 10000)
    .click('.compileView')
  contractHelper.testContracts(browser, 'Untitled.sol', sources[0]['browser/Untitled.sol'], ['browser/Untitled.sol:Ballot'], function () {
    browser
      .click('.runView')
      .setValue('input[placeholder="uint8 _numProposals"]', '1', () => {})
      .click('#runTabView div[class^="create"]')
      .testFunction('delegate - transact (not payable)', '0xd3cd54e2f76f3993078ecf9e1b54a148def4520afc141a182293b3610bddf10f',
        '[vm] from:0xca3...a733c, to:browser/Untitled.sol:Ballot.delegate(address) 0x692...77b3a, value:0 wei, data:0x5c1...4d2db, 0 logs, hash:0xd3c...df10f',
        {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'}, null, null)
      .click('span#tx0xd3cd54e2f76f3993078ecf9e1b54a148def4520afc141a182293b3610bddf10f button[class^="debug"]')
      .pause(1000)
      .click('#jumppreviousbreakpoint')
      .click('#stepdetail .title')
      .click('#asmcodes .title')
      .pause(500)
      .perform(function (client, done) {
        contractHelper.goToVMtraceStep(browser, 39, () => {
          done()
        })
      })
      .pause(2000)
      .perform(function (client, done) {
        contractHelper.checkDebug(browser, 'soliditystate', stateCheck, () => {
          done()
        })
      })
      .perform(function (client, done) {
        contractHelper.checkDebug(browser, 'soliditylocals', localsCheck, () => {
          done()
          browser.end()
        })
      })
  })
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
