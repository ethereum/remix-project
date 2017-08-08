'use strict'

var examples = require('../../src/app/editor/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'browser/ballot.sol': examples.ballot.content,
    'browser/test/client/credit.sol': '',
    'browser/src/voting.sol': '',
    'browser/src/leasing.sol': '',
    'browser/src/gmbh/contract.sol': false,
    'browser/src/gmbh/test.sol': false,
    'browser/src/gmbh/company.sol': false,
    'browser/src/gmbh/node_modules/ballot.sol': false,
    'browser/src/ug/finance.sol': false,
    'browser/app/solidity/mode.sol': true,
    'browser/app/ethereum/constitution.sol': true
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
