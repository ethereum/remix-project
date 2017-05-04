'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'Untitled': `pragma solidity ^0.4.0;
      contract TestContract { function f() returns (uint) { return 8; } }`
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Compiling': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('.newFile', 10000)
    .click('.envView')
  contractHelper.testContracts(browser, sources.sources.Untitled, ['Untitled:TestContract'], function () {
    browser.click('.create .constructor .call')
      .waitForElementPresent('.instance .call[title="f"]')
      .click('.instance .call[title="f"]')
      .waitForElementPresent('.output .returned')
      .assert.containsText('.output .returned', '0x0000000000000000000000000000000000000000000000000000000000000008')
      .assert.containsText('.output .decoded li', 'uint256: 8')
      .end()
  })
}
