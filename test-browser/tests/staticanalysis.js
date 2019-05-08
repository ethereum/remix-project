'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')
var dom = require('../helpers/dom')

var sources = [
  {
    'browser/Untitled.sol': {content: `
contract test1 { address test = tx.origin; }
contract test2 {}
contract TooMuchGas {
  uint x;
  function() external { 
      x++;
    uint test;
    uint test1;
  }
}`}}
]

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
  browser.setEditorValue = contractHelper.setEditorValue
  browser.clickLaunchIcon = contractHelper.clickLaunchIcon
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
  contractHelper.testContracts(browser, 'Untitled.sol', sources[0]['browser/Untitled.sol'], ['TooMuchGas', 'test1', 'test2'], function () {
    browser
      .clickLaunchIcon('solidityStaticAnalysis')
      .click('#staticanalysisView button')
      .waitForElementPresent('#staticanalysisresult .staticAnalysisWarning', 2000, true, function () {
        dom.listSelectorContains(['browser/Untitled.sol:2:33:Use of tx.origin',
          'Fallback function of contract TooMuchGas requires too much gas',
          'TooMuchGas.() : Variables have very similar names test and test1.'],
          '#staticanalysisresult .staticAnalysisWarning',
          browser, function () {
            browser.end()
          }
        )
      })
  })
}
