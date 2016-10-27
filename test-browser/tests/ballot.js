'use strict'
var contractHelper = require('../helpers/contracts')
var examples = require('../../src/app/example-contracts')
var init = require('../helpers/init')

var sources = {
  'sources': {
    'Untitled': examples.ballot.content
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@Sources': function () {
    return sources
  },
  'Ballot': function (browser) {
    runTests(browser)
  }
}

function runTests (browser, testData) {
  browser
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['Ballot'], function () {
    browser.end()
  })
}
