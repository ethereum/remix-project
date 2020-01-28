'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

/**
 * both are declared, sending data
 * both are declared - receive called, sending wei
 * both are declared - fallback should fail cause not payable, sending data and wei
 * receive is declared, failing, fallback is not declared, sending data
 * receive is not declared, fallback is payable, sending wei
 * receive is not declared, fallback is payable, sending data and wei
 * both are not declared, sending data and wei, should fail
 */
module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Use special functions receive/fallback - both are declared, sending data': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('receiveAndFallback.sol', sources[0]['browser/receiveAndFallback.sol'], ['CheckSpecials']) // compile
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('') // deploy
    .clickInstance(0)
    .perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '0', '0xaa')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(fallback)')
        .journalLastChildIncludes('value:0 wei')
        .journalLastChildIncludes('data:0xaa')
        .perform(done)
      })
    })
  },
  'Use special functions receive/follback - both are declared - receive called, sending wei': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '1', '')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(receive)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0x')
        .perform(done)
      })
    })
  },
  'Use special functions receive/follback - both are declared - fallback should fail cause not payable, sending data and wei': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '10', '0xaa')
        .pause(1000)
        .journalLastChildIncludes('to CheckSpecials.(fallback) errored:')
        .journalLastChildIncludes('The called function should be payable if you send value')
        .perform(done)
      })
    })
  },
  'Use special functions receive/follback - receive is declared, failing, fallback is not declared, sending data': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('receiveOnly.sol', sources[1]['browser/receiveOnly.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('')
    .clickInstance(1)
    .perform((done) => {
      browser.getAddressAtPosition(1, (address) => {
        browser.sendLowLevelTx(address, '0', '0xaa')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `'fallback' function is not defined`)
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - receive is not declared, fallback is payable, sending wei': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('fallbackOnlyPayable.sol', sources[2]['browser/fallbackOnlyPayable.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('')
    .clickInstance(2)
    .perform((done) => {
      browser.getAddressAtPosition(2, (address) => {
        browser.sendLowLevelTx(address, '1', '')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(fallback)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0x')
        .perform(done)
      })
    })
  },
  'Use special functions receive/follback - receive is not declared, fallback is payable, sending data and wei': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(2, (address) => {
        browser.sendLowLevelTx(address, '1', '0xaa')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(fallback)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0xaa')
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - receive is not declared, fallback should fail cause not payable, sending wei': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('fallbackOnlyNotPayable.sol', sources[3]['browser/fallbackOnlyNotPayable.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('')
    .clickInstance(3)
    .perform((done) => {
      browser.getAddressAtPosition(3, (address) => {
        browser.sendLowLevelTx(address, '1', '')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `should have either 'receive' or payable 'fallback'`)
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - receive and fallback are declared, sending data and wei': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('receiveAndFallbackBothPayable.sol', sources[4]['browser/receiveAndFallbackBothPayable.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .pause(10000)
    .selectContract('CheckSpecials')
    .pause(10000)
    .waitForElementVisible('#value')
    .clearValue('#value')
    .setValue('#value', 0)
    .createContract('')
    .pause(10000)
    .clickInstance(4)
    .pause(10000)
    .perform((done) => {
      browser.getAddressAtPosition(4, (address) => {
        browser.sendLowLevelTx(address, '1', '0xaa')
        .pause(100000)
        .journalLastChildIncludes('to:CheckSpecials.(fallback)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0xaa')
        .perform(done)
      })
    })
    .end()
  },
  tearDown: sauce
}

var sources = [
  {
    'browser/receiveAndFallback.sol': {
      content: `
        contract CheckSpecials {
          receive() payable external{}
          fallback() external {}
        }
      `
    }
  },
  {
    'browser/receiveOnly.sol': {
      content: `
        contract CheckSpecials {
          receive() payable external {}
        }
      `
    }
  },
  {
    'browser/fallbackOnlyPayable.sol': {
      content: `
        contract CheckSpecials {
          fallback() payable external {}
        }
      `
    }
  },
  {
    'browser/fallbackOnlyNotPayable.sol': {
      content: `
        contract CheckSpecials {
          fallback() external {}
        }
      `
    }
  },
  {
    'browser/receiveAndFallbackBothPayable.sol': {
      content: `
        contract CheckSpecials {
          receive() payable external {}
          fallback() payable external {}
        }
      `
    }
  }
]
