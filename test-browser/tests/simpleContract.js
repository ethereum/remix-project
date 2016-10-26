'use strict'
var contractHelper = require('../helpers/contracts')

var sources = {
  'sources': {
    'Untitled': 'contract test1 {} contract test2 {}'
  }
}

module.exports = {
  '@Sources': function () {
    return sources
  },
  'Simple Contract': function (browser) {
    runTests(browser)
  }
}

function runTests (browser) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['test1', 'test2'], function () {
    browser.end()
  })
}
