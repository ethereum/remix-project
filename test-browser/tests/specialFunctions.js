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
  'Use special functions receive/fullback': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .testContracts('browser/receiveAndfFallback.sol', sources[0]['receiveAndfFallback.sol'], ['CheckSpecials'])
    .clickLaunchIcon('udapp')
    .selectContract('CheckSpecials')
    .createContract('')
    .clickInstance(0)
    .perform((done) => {
      browser.getAddressAtPosition(0, (address) => {
        browser.sendLowLevelTx(address, '0', '0xaa')
        .journalLastChild('dd')
        .waitForElementVisible('label[id="deployAndRunLLTxError"]')
        .assert.containsText('label[id="deployAndRunLLTxError"]', '')
        .perform(done)
      })
    })
  },
  tearDown: sauce
}

var sources = [
  {
    'browser/receiveAndfFallback.sol': {
      content: `
        contract CheckSpecials {
          receive() payable external{}
          fallback() external {}
        }
      `
    },
    'browser/receiveOnly.sol': {
      content: `
        contract CheckSpecials {
          receive() payable external{}
        }
      `
    },
    'browser/fallbackOnly.sol': {
      content: `
        contract CheckSpecials {
          fallback() payable external{}
        }
      `
    }
  }
]
