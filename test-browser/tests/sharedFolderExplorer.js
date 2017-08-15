'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'localhost/folder1/contract2.sol': 'contract test2 { function get () returns (uint) { return 11; }}'
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'SharedFolderExplorer': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser, testData) {
  var browserName = browser.options.desiredCapabilities.browserName
  if (browserName === 'safari' || browserName === 'internet explorer') {
    console.log('do not run remixd test for ' + browserName + ': sauce labs doesn\'t seems to handle websocket')
    browser.end()
    return
  }
  browser
    .waitForElementVisible('.newFile', 10000)
    .click('.websocketconn')
    .waitForElementVisible('#modal-footer-ok', 10000)
    .click('#modal-footer-ok')
    .waitForElementVisible('[data-path="localhost"]', 100000)
    .click('[data-path="localhost"]')
    .click('[data-path="localhost/folder1"]')
    .assert.containsText('[data-path="localhost/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/contract2.sol"]', 'contract2.sol')
    .assert.containsText('[data-path="localhost/folder1/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/folder1/contract2.sol"]', 'contract2.sol')
    .click('[data-path="localhost/folder1/contract2.sol"]')
    .waitForElementPresent('#compileTabView select option', 50000, true, function () {
      contractHelper.checkCompiledContracts(browser, ['localhost/folder1/contract2.sol:test2'], function () {
        browser.click('.websocketconn').end()
      })
    })
}
