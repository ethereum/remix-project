'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'Untitled': `contract test1 { address test = tx.origin; } contract test2 {}`
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Static Analysis': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['test1', 'test2'], function () {
    browser
    .click('.staticanalysisView')
    .click('#staticanalysisView button')
    .waitForElementPresent('#staticanalysisresult .warning')
    .assert.containsText('#staticanalysisresult .warning pre', 'Untitled:1:33: use of tx.origin')
    .end()
  })
}
