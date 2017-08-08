'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'browser/Untitled.sol': `pragma solidity ^0.4.0;
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
    .click('.compileView')
  contractHelper.testContracts(browser, sources.sources['browser/Untitled.sol'], ['browser/Untitled.sol:TestContract'], function () {
    browser.click('.runView')
    .click('#runTabView div[class^="create"]')
    .waitForElementPresent('.instance button[title="f"]')
    .click('.instance button[title="f"]')
    .end()
    /*
    TODO: this will be logged in the dom console
    .waitForElementPresent('.output .returned')
    .assert.containsText('.output .returned', '0x0000000000000000000000000000000000000000000000000000000000000008')
    .execute(function () {
      document.querySelector('.output .decoded li').scrollIntoView()
    }, [], function () {
      browser.assert.containsText('.output .decoded li', 'uint256: 8')
      .end()
    })
    */
  })
}
