'use strict'
var contractHelper = require('../helpers/contracts')
var examples = require('../../src/app/example-contracts')

var sources = {
  'sources': {
    'Untitled': examples.ballot.content
  }
}

module.exports = {
  '@Sources': function () {
    return sources
  },
  'Ballot': function (browser) {
    runTests(browser)
  }
}

function runTests (browser, testData) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['Ballot'], function () {
    browser.end()
  })
}
