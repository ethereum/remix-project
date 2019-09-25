'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = []

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Solidity Unittests': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .click('#icon-panel div[plugin="pluginManager"]')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_solidityUnitTesting"] button')
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/ballot.sol')
    .clickLaunchIcon('solidityUnitTesting')
    .scrollAndClick('#runTestsTabRunAction')
    .waitForElementPresent('#solidityUnittestsOutput div[class^="testPass"]')
    .assert.containsText('#solidityUnittestsOutput', `browser/ballot_test.sol (test3)
    ✓ (Check winning proposal)
    ✓ (Check winnin proposal with return value)`)
    .end()
}
