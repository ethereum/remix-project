'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

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
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c') // this account will be used for this test suite
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
  'Use special functions receive/fallback - both are declared, failing sending data < 1 byte': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '0', '0xa')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `The calldata should be a valid hexadecimal value with size of at least one byte.`)
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - both are declared, failing sending data with odd number of digits': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '0', '0x1aa')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `The calldata should be a valid hexadecimal value.`)
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - both are declared - receive called, sending wei': function (browser) {
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
  'Use special functions receive/fallback - both are declared - fallback should fail cause not payable, sending data and wei': function (browser) {
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
  'Use special functions receive/fallback - only receive is declared, sending wei': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('receiveOnly.sol', sources[1]['browser/receiveOnly.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('')
    .clickInstance(1)
    .perform((done) => {
      browser.getAddressAtPosition(1, (address) => {
        browser.sendLowLevelTx(address, '1', '')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(receive)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0x')
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - only receive is declared, failing, fallback is not declared, sending data': function (browser) {
    // don't need to redeploy it, same contract
    browser.perform((done) => {
      browser.getAddressAtPosition(1, (address) => {
        browser.sendLowLevelTx(address, '0', '0xaa')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `'Fallback' function is not defined`)
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - only fallback declared and is payable, sending wei': function (browser) {
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
  'Use special functions receive/fallback - only fallback is diclared and is payable, sending data and wei': function (browser) {
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
  'Use special functions receive/fallback - only fallback is declared, fallback should fail cause not payable, sending wei': function (browser) {
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
    .selectContract('CheckSpecials')
    .waitForElementVisible('#value')
    .clearValue('#value')
    .setValue('#value', 0)
    .createContract('')
    .clickInstance(4)
    .pause(1000)
    .perform((done) => {
      browser.getAddressAtPosition(4, (address) => {
        browser.sendLowLevelTx(address, '1', '0xaa')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(fallback)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0xaa')
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - receive and fallback are declared and payable, sending wei': function (browser) {
    browser.perform((done) => {
      browser.getAddressAtPosition(4, (address) => {
        browser.sendLowLevelTx(address, '1', '')
        .pause(1000)
        .journalLastChildIncludes('to:CheckSpecials.(receive)')
        .journalLastChildIncludes('value:1 wei')
        .journalLastChildIncludes('data:0x')
        .perform(done)
      })
    })
  },
  'Use special functions receive/fallback - receive and fallback are not declared, sending nothing': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('notSpecial.sol', sources[5]['browser/notSpecial.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .waitForElementVisible('#value')
    .clearValue('#value')
    .setValue('#value', 0)
    .createContract('')
    .clickInstance(5)
    .pause(1000)
    .perform((done) => {
      browser.getAddressAtPosition(5, (address) => {
        browser.sendLowLevelTx(address, '0', '')
        .pause(1000)
        .waitForElementVisible(`#instance${address} label[id="deployAndRunLLTxError"]`)
        .assert.containsText(`#instance${address} label[id="deployAndRunLLTxError"]`, `Both 'receive' and 'fallback' functions are not defined`)
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
  },
  {
    'browser/notSpecial.sol': {
      content: `
        contract CheckSpecials {
          function otherFallback() payable external {}
        }
      `
    }
  }
]
