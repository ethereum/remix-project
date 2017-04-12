'use strict'

var examples = require('../../src/app/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'ballot.sol': examples.ballot.content,
    'test/client/credit.sol': '',
    'src/voting.sol': '',
    'src/leasing.sol': '',
    'src/gmbh/contract.sol': false,
    'src/gmbh/test.sol': false,
    'src/gmbh/company.sol': false,
    'src/gmbh/node_modules/ballot.sol': false,
    'src/ug/finance.sol': false,
    'app/solidity/mode.sol': true,
    'app/ethereum/constitution.sol': true
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'FileExplorer': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser, testData) {
  browser
    .waitForElementPresent('#filepanel ul li', 10000, true, function () {})
    .end()
}
