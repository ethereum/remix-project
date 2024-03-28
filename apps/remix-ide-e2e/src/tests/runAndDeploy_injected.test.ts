'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const passphrase = process.env.account_passphrase
const password = process.env.account_password

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should connect to Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .setupMetamask(passphrase, password)      
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
      .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Sepolia (11155111) network')
      .switchBrowserTab(1) // switch to metamask
      .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
      .click('.page-container__footer-button:nth-of-type(2)')
      .switchBrowserTab(0)
  },

  'Should add a contract file #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .addFile('Greet.sol', sources[0]['Greet.sol'])
      .clickLaunchIcon('udapp')
      .waitForElementVisible('*[data-id="Deploy - transact (not payable)"]', 45000) // wait for the contract to compile
  },

  'Should deploy contract on Goerli Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
      .clickLaunchIcon('filePanel')
      .openFile('Greet.sol')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .switchBrowserTab(2)
      .waitForElementPresent('.transaction-status--unapproved')
      .click('.transaction-status--unapproved')
      .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
      .click('.page-container__footer-button:nth-of-type(2)')
      .waitForElementPresent('.transaction-status--submitted')
      .pause(25000)
      .switchBrowserTab(0)
  },

  'Should run low level interaction (fallback function) on Goerli Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
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
      .pause(25000)
      .switchBrowserTab(0)
  },

  'Should connect to Ethereum Main Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .switchBrowserTab(2)
      .waitForElementPresent('.network-indicator__down-arrow')
      .click('.network-indicator__down-arrow')
      .useXpath().click("//span[text()='Main Ethereum Network']")
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
      .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Main (1) network')
  },

  'Should deploy contract on Ethereum Main Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
      .clickLaunchIcon('filePanel')
      .openFile('Greet.sol')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementPresent('*[data-id="modalDialogContainer"]', 15000)
      .pause(10000)
      .assert.containsText('*[data-id="modalDialogModalBody"]', 'You are creating a transaction on the main network. Click confirm if you are sure to continue.')
      .modalFooterCancelClick()
  },

  /*
   * This test is using 3 different services:
   * - Metamask for getting the transaction
   * - Source Verifier service for fetching the contract code
   * - Ropsten node for retrieving the trace and storage
   *
   */
  'Should debug Ropsten transaction with source highlighting using the source verifier service and MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .switchBrowserTab(2)
      .waitForElementPresent('.network-indicator__down-arrow')
      .click('.network-indicator__down-arrow')
      .useXpath().click("//span[text()='Ropsten Test Network']") // switch to Ropsten
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .clickLaunchIcon('pluginManager') // load debugger and source verification
    // .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_sourcify"] button')
    // debugger already activated .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
      .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]') // switch to Ropsten in udapp
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Ropsten (3) network')
      .clickLaunchIcon('debugger')
      .setValue('*[data-id="debuggerTransactionInput"]', '0x959371506b8f6223d71c709ac2eb2d0158104dca2d76ca949f1662712cf0e6db') // debug tx
      .click('*[data-id="debuggerTransactionStartButton"]')
      .waitForElementVisible('*[data-id="treeViewDivto"]', 30000)
      .assert.containsText('*[data-id="stepdetail"]', 'loaded address:\n0x3c943Fb816694d7D1f4C738e3e7823818a88DD6C')
      .assert.containsText('*[data-id="solidityLocals"]', 'to: 0x6C3CCC7FBA111707D5A1AAF2758E9D4F4AC5E7B1')
  },

  'Call web3.eth.getAccounts() using Injected Provider (Metamask) #group1': function (browser: NightwatchBrowser) {
    browser
      .executeScriptInTerminal('web3.eth.getAccounts()')
      .journalLastChildIncludes('[ "0x76a3ABb5a12dcd603B52Ed22195dED17ee82708f" ]')
  }  
}

const sources = [
  {
    'Greet.sol': {
      content:
      `
      pragma solidity ^0.8.0;
      contract HelloWorld {
          string public message;
          
          fallback () external {
              message = 'Hello World!';
          }
          
          function greet(string memory _message) public {
              message = _message;
          }
      }`
    },
    'checkBalance.sol': {
      content: `pragma solidity ^0.8.0;
      contract CheckBalance {
        constructor () payable {}

        function sendSomeEther(uint256 num) public {
            payable(msg.sender).transfer(num);
        }
    
    }`
    }
  }
]
