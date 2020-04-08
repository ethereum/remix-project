'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

const passphrase = process.env.account_passphrase
const password = process.env.account_password

module.exports = {

  before: function (browser, done) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should load run and deploy tab': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .pause(3000)
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="sidePanelSwapitTitle"]')
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEPLOY & RUN TRANSACTIONS')
  },

  'Should sign message using account key': function (browser) {
    browser.waitForElementPresent('*[data-id="settingsRemixRunSignMsg"]')
    .click('*[data-id="settingsRemixRunSignMsg"]')
    .waitForElementPresent('*[data-id="modalDialogContainer"]')
    .click('*[data-id="modalDialogCustomPromptText"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', 'Remix is cool!')
    .assert.elementNotPresent('*[data-id="settingsRemixRunSignMsgHash"]')
    .assert.elementNotPresent('*[data-id="settingsRemixRunSignMsgSignature"]')
    .modalFooterOKClick()
    .pause(2000)
    .waitForElementPresent('*[data-id="modalDialogContainer"]')
    .assert.elementPresent('*[data-id="settingsRemixRunSignMsgHash"]')
    .assert.elementPresent('*[data-id="settingsRemixRunSignMsgSignature"]')
    .modalFooterOKClick()
  },

  'Should deploy contract on JavascriptVM': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .clickLaunchIcon('fileExplorers')
    .addFile('Greet.sol', sources[0]['browser/Greet.sol'])
    .clickLaunchIcon('udapp')
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
    .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .pause(5000)
    .testFunction('0xf887e3ac3143430b0c22d055eb25d234675e7f3246cb0824efc4c1437a1405d5', {
      status: '0x1 Transaction mined and execution succeed',
      'transaction hash': '0xf887e3ac3143430b0c22d055eb25d234675e7f3246cb0824efc4c1437a1405d5'
    })
  },

  'Should run low level interaction (fallback function)': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .waitForElementPresent('*[data-id="universalDappUiTitleExpander"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .waitForElementPresent('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
    .click('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
    .pause(5000)
    .testFunction('0xfe718871ee0b4d03cdcac0e12e5b164efaf7e23ba952c07db76e62692867019b', {
      status: '0x1 Transaction mined and execution succeed',
      'transaction hash': '0xfe718871ee0b4d03cdcac0e12e5b164efaf7e23ba952c07db76e62692867019b'
    })
  },

  'Should connect to Ropsten Test Network using MetaMask': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .setupMetamask(passphrase, password)
    .click('.network-indicator__down-arrow')
    .useXpath().click("//span[text()='Ropsten Test Network']")
    .useCss().switchBrowserTab(0)
    .refresh()
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .click('*[data-id="landingPageStartSolidity"]')
    .pause(5000)
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
    .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]')
    .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
    .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Ropsten (3) network')
    .switchBrowserTab(2)
    .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
    .click('.page-container__footer-button:nth-of-type(2)')
    .switchBrowserTab(0)
  },

  'Should deploy contract on Ropsten Test Network using MetaMask': function (browser) {
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/Greet.sol')
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .switchBrowserTab(2)
    .waitForElementPresent('.transaction-status--unapproved')
    .click('.transaction-status--unapproved')
    .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
    .click('.page-container__footer-button:nth-of-type(2)')
    .waitForElementPresent('.transaction-status--submitted')
    .pause(35000)
    .switchBrowserTab(0)
  },

  'Should run low level interaction (fallback function) on Ropsten Test Network using MetaMask': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .waitForElementPresent('*[data-id="universalDappUiTitleExpander"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .waitForElementPresent('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
    .click('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
    .switchBrowserTab(2)
    .waitForElementPresent('.transaction-status--unapproved')
    .click('.transaction-status--unapproved')
    .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
    .click('.page-container__footer-button:nth-of-type(2)')
    .waitForElementPresent('.transaction-status--submitted')
    .pause(35000)
    .switchBrowserTab(0)
  },

  'Should connect to Ethereum Main Network using MetaMask': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .switchBrowserTab(2)
    .waitForElementPresent('.network-indicator__down-arrow')
    .click('.network-indicator__down-arrow')
    .useXpath().click("//span[text()='Main Ethereum Network']")
    .useCss().switchBrowserTab(0)
    .refresh()
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .click('*[data-id="landingPageStartSolidity"]')
    .pause(5000)
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
    .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]')
    .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
    .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Main (1) network')
  },

  'Should deploy contract on Ethereum Main Network using MetaMask': function (browser) {
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/Greet.sol')
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .waitForElementPresent('*[data-id="modalDialogContainer"]')
    .assert.containsText('*[data-id="modalDialogModalBody"]', 'You are creating a transaction on the main network. Click confirm if you are sure to continue.')
    .modalFooterCancelClick()
    .end()
  },

  tearDown: sauce
}

var sources = [
  {
    'browser/Greet.sol': {
      content:
      `
      pragma solidity ^0.6.0;

      contract helloWorld {
          string public message;
          
          fallback () external {
              message = 'Hello World!';
          }
          
          function greet(string memory _message) public {
              message = _message;
          }
      }`
    }
  }
]
