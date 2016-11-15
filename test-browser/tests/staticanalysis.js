'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = {
  'sources': {
    'Untitled': `
contract test1 { address test = tx.origin; }
contract test2 {}
contract TooMuchGas {
  uint x;
  function() { x++; }
}`
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

function findText (browser, selector, textToFind) {
  var found = false
  browser
    .elements('css selector', selector, function (warnings) {
      warnings.value.forEach(function (warning) {
        browser.elementIdText(warning.ELEMENT, function (text) {
          if (text.indexOf(textToFind) >= 0) {
            found = true
          }
        })
      })
    })
  browser.assert.equal(found, true)
}

function runTests (browser) {
  browser
    .waitForElementVisible('.newFile', 10000)
  contractHelper.testContracts(browser, sources.sources.Untitled, ['TooMuchGas', 'test1', 'test2'], function () {
    browser
      .click('.staticanalysisView')
      .click('#staticanalysisView button')
      .waitForElementPresent('#staticanalysisresult .warning')
    findText(browser, '#staticanalysisresult .warning span',
      'Untitled:2:33: use of tx.origin')
    findText(browser, '#staticanalysisresult .warning span',
      'Fallback function of contract TooMuchGas requires too much gas')
    browser.end()
  })
}
