'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = [
  {
    'browser/Untitled.sol': {content: `
pragma solidity >=0.4.22 <0.6.0;
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
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['TooMuchGas', 'test1', 'test2'])
    .clickLaunchIcon('solidityStaticAnalysis')
    .click('#staticanalysisView button')
    .waitForElementPresent('#staticanalysisresult .staticAnalysisWarning', 2000, true, function () {
      listSelectorContains(['browser/Untitled.sol:3:33:Use of tx.origin',
        'Fallback function of contract TooMuchGas requires too much gas',
        'TooMuchGas.() : Variables have very similar names test and test1.'],
        '#staticanalysisresult .staticAnalysisWarning',
        browser, function () {
          browser.end()
        }
      )
    })
}

function listSelectorContains (textsToFind, selector, browser, callback) {
  browser.execute(function (selector) {
    var items = document.querySelectorAll(selector)
    var ret = []
    for (var k = 0; k < items.length; k++) {
      ret.push(items[k].innerText)
    }
    return ret
  }, [selector], function (result) {
    console.log(result.value)
    for (var k in textsToFind) {
      console.log('testing ' + result.value[k] + ' against ' + textsToFind[k])
      browser.assert.equal(result.value[k].indexOf(textsToFind[k]) !== -1, true)
    }
    callback()
  })
}
