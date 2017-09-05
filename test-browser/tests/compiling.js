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
    .waitForElementPresent('.instance button[title="f - transact (not payable)"]')
    .click('.instance button[title="f - transact (not payable)"]')
    .waitForElementPresent('#editor-container div[class^="terminal"] span[id="tx0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc"]')
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc"]', '(vm): from:0xca3...a733c, to:0x692...77b3a, browser/Untitled.sol:TestContract.f(), value:0 wei, data:0x261...21ff0, 0 logs, hash:0xa17...523bc,DetailsDebug')
    .end()
    /*
    @TODO: need to check now the return value of the function
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
