'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'browser/Untitled.sol': `pragma solidity ^0.4.0;
      contract TestContract { function f() returns (uint) { return 8; } 
      function g() returns (uint, string, bool, uint) {  
        uint payment = 345;
        bool payed = true;
        string memory comment = "comment_comment_";
        uint month = 4;
        return (payment, comment, payed, month); } }`
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
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc"]', '[vm] from:0xca3...a733c, to:browser/Untitled.sol:TestContract.f() 0x692...77b3a, value:0 wei, data:0x261...21ff0, 0 logs, hash:0xa17...523bc')
    .click('#editor-container div[class^="terminal"] span[id="tx0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc"] button[class^="details"]')
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx0xa178c603400a184ce5fedbcfab392d9b77822f6ffa7facdec693aded214523bc"] table[class^="txTable"] #decodedoutput', `{
 "0": "uint256: 8"
}`)
    .click('.instance button[title="g - transact (not payable)"]')
    .waitForElementPresent('#editor-container div[class^="terminal"] span[id="tx0xb1532162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92781"]')
    .click('#editor-container div[class^="terminal"] span[id="tx0xb1532162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92781"] button[class^="details"]')
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx0xb1532162e2e31397dc1e07ed0a1cf08f728e9b4487c6f9ed79d2f39410c92781"] table[class^="txTable"] #decodedoutput', `{
 "0": "uint256: 345",
 "1": "string: comment_comment_",
 "2": "bool: true",
 "3": "uint256: 4"
}`)
    .end()
  })
}
