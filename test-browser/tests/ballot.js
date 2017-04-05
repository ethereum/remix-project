'use strict'
var contractHelper = require('../helpers/contracts')
var examples = require('../../src/app/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'Untitled': examples.ballot.content
  }
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Ballot': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser, testData) {
  browser
    .waitForElementVisible('.newFile', 10000)
    .click('.envView')
  contractHelper.testContracts(browser, sources.sources.Untitled, ['Untitled:Ballot'], function () {
    browser.end()
  })
}
