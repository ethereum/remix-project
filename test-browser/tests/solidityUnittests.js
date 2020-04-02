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
    .switchFile('browser/3_Ballot.sol')
    .clickLaunchIcon('solidityUnitTesting')
    .scrollAndClick('#runTestsTabRunAction')
    .pause(5000)
    .waitForElementPresent('#solidityUnittestsOutput div[class^="testPass"]')
    .pause(10000)
    .assert.containsText('#solidityUnittestsOutput', 'browser/4_Ballot_test.sol (BallotTest)')
    .assert.containsText('#solidityUnittestsOutput', '✓ (Check winning proposal)')
    .assert.containsText('#solidityUnittestsOutput', '✓ (Check winnin proposal with return value)')
    .end()
}
