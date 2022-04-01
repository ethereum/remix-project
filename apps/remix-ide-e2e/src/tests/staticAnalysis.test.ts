'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const sources = [
  {
    'Untitled.sol': {
      content: `
pragma solidity >=0.6.0 <0.8.0;
contract test1 { address test = tx.origin; }
contract test2 {}
contract TooMuchGas {
  uint x;
  fallback() external { 
      x++;
    uint test;
    uint test1;
  }
}`
    }
  }
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Static Analysis': function (browser: NightwatchBrowser) {
    runTests(browser)
  },
  'run analysis and filter results': function (browser: NightwatchBrowser) {
    browser
    .clickLaunchIcon('filePanel')
    .click('*[data-id="treeViewLitreeViewItemcontracts"]')
    .click('*[data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]')
    .clickLaunchIcon('solidity')
    .pause(10000)
    .clickLaunchIcon('solidityStaticAnalysis')
    .waitForElementPresent('#staticanalysisresult .warning', 5000)
    .assert.containsText('#verticalIconsKindsolidityStaticAnalysis .remixui_status', '1') // Check warning count
    .verify.elementPresent('input[name="showLibWarnings"]')
    .verify.elementNotPresent('input[name="showLibWarnings"]:checked')
    .verify.elementPresent('label[id="headingshowLibWarnings"]')
    .click('label[id="headingshowLibWarnings"]')
    .pause(1000)
    .assert.containsText('#verticalIconsKindsolidityStaticAnalysis .remixui_status', '382')
    .click('label[id="headingshowLibWarnings"]')
    .pause(1000)
    .assert.containsText('#verticalIconsKindsolidityStaticAnalysis .remixui_status', '1')
    .end()
  }
}

function runTests (browser: NightwatchBrowser) {
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .pause(10000)
    .testContracts('Untitled.sol', sources[0]['Untitled.sol'], ['TooMuchGas', 'test1', 'test2'])
    .clickLaunchIcon('solidityStaticAnalysis')
    .click('#staticanalysisButton button')
    .waitForElementPresent('#staticanalysisresult .warning', 2000, true, function () {
      listSelectorContains(['Use of tx.origin',
        'Fallback function of contract TooMuchGas requires too much gas',
        'TooMuchGas.() : Variables have very similar names "test" and "test1".',
        'TooMuchGas.() : Variables have very similar names "test" and "test1".'],
      '#staticanalysisresult .warning',
      browser
      )
    })
}

function listSelectorContains (textsToFind: string[], selector: string, browser: NightwatchBrowser) {
  browser.execute(function (selector) {
    const items = document.querySelectorAll(selector)
    const ret = []
    for (let k = 0; k < items.length; k++) {
      ret.push(items[k].innerText)
    }
    return ret
  }, [selector], function (result) {
    console.log(result.value)
    for (const k in textsToFind) {
      console.log('testing `' + result.value[k] + '` against `' + textsToFind[k] + '`')
      browser.assert.equal(result.value[k].indexOf(textsToFind[k]) !== -1, true)
    }
  })
}
