'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'Untitled': 'contract test1 {} contract test2 {}'
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Simple Contract': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('.newFile', 10000)
    .click('.envView')
  contractHelper.testContracts(browser, sources.sources.Untitled, ['Untitled:test1', 'Untitled:test2'], function () {
    browser.end()
  })
}
