'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const passphrase = 'explain uniform adapt basic blue onion rebel pull rice erase volcano couple'
const password = 'remix_is_cool'

const checkBrowserIsChrome = function (browser: NightwatchBrowser) {
  return browser.browserName.indexOf('chrome') > -1
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should connect to Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .setupMetamask(passphrase, password)      
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .clickLaunchIcon('udapp')
      .switchEnvironment('MetaMask')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Sepolia (11155111) network')
      .pause(5000)
      .switchBrowserWindow('chrome-extension://mmejnnbljapjihcidiglpfkpnojpiamk/home.html', 'MetaMask', (browser) => {
        browser
          .waitForElementVisible('*[data-testid="page-container-footer-next"]')
          .click('*[data-testid="page-container-footer-next"]') // this connects the metamask account to remix
          .pause(2000)
          .waitForElementVisible('*[data-testid="page-container-footer-next"]')
          .click('*[data-testid="page-container-footer-next"]')
          // .waitForElementVisible('*[data-testid="popover-close"]')
          // .click('*[data-testid="popover-close"]')
      })
      .switchBrowserTab(0) // back to remix
  },

  'Should add a contract file #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .addFile('Greet.sol', sources[0]['Greet.sol'])
      .clickLaunchIcon('udapp')
      .waitForElementVisible('*[data-id="Deploy - transact (not payable)"]', 45000) // wait for the contract to compile
  },

  'Should deploy contract on Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.clearConsole().waitForElementPresent('*[data-id="runTabSelectAccount"] option', 45000)
      .clickLaunchIcon('filePanel')
      .openFile('Greet.sol')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(5000)
      .perform((done) => {
        browser.switchBrowserWindow('chrome-extension://mmejnnbljapjihcidiglpfkpnojpiamk/home.html', 'MetaMask', (browser) => {
          browser
            .waitForElementPresent('[data-testid="page-container-footer-next"]')
            .click('[data-testid="page-container-footer-next"]') // approve the tx
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .perform(() => done())
        })
      })      
  },

  'Should run low level interaction (fallback function) on Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.clearConsole().waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .clickInstance(0)
      .waitForElementPresent('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .click('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .perform((done) => {
        browser.switchBrowserWindow('chrome-extension://mmejnnbljapjihcidiglpfkpnojpiamk/home.html', 'MetaMask', (browser) => {
          browser
            .waitForElementPresent('[data-testid="page-container-footer-next"]')
            .click('[data-testid="page-container-footer-next"]') // approve the tx
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .perform(() => done())
        })      
      })      
  },

  'Should connect to Ethereum Main Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .switchBrowserTab(1)
      .click('[data-testid="network-display"]')
      .click('div[data-testid="Ethereum Mainnet"]') // switch to mainnet
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .clickLaunchIcon('udapp')
      .switchEnvironment('MetaMask')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Main (1) network')
  },

  'Should deploy contract on Ethereum Main Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
      .clickLaunchIcon('filePanel')
      .openFile('Greet.sol')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalBody-react"]', 65000)
      .modalFooterOKClick('udappNotify')
      .pause(10000)
      .assert.containsText('*[data-id="udappNotifyModalDialogModalBody-react"]', 'You are about to create a transaction on Main Network. Confirm the details to send the info to your provider.')
      .modalFooterCancelClick('udappNotify')
  },

  /*
   * This test is using 3 different services:
   * - Metamask for getting the transaction
   * - Source Verifier service for fetching the contract code
   * - Sepolia node for retrieving the trace and storage
   *
   */
  'Should debug Sepolia transaction with source highlighting using the source verifier service and MetaMask #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .switchBrowserTab(1)
      .click('[data-testid="network-display"]')
      .click('div[data-testid="Sepolia"]') // switch to sepolia
      .useCss().switchBrowserTab(0)
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('pluginManager') // load debugger and source verification
    // .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_sourcify"] button')
    // debugger already activated .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
      .clickLaunchIcon('udapp')
      .switchEnvironment('MetaMask')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Sepolia (11155111) network')
      .clickLaunchIcon('debugger')
      .setValue('*[data-id="debuggerTransactionInput"]', '0xe92c2482686566a0f02f78fc4b7b154fa54734a2de7fff17b38a42a0cb64e210') // debug tx
      .click('*[data-id="debuggerTransactionStartButton"]')
      .waitForElementVisible('*[data-id="treeViewDivto"]', 30000)
      .assert.containsText('*[data-id="stepdetail"]', 'loaded address:\n0xbdf0D592CB3DB429DE1c03e52ea35d92eba31BD8')
      .assert.containsText('*[data-id="solidityLocals"]', 'to: 0x78CddD795A3ed0EFF3eFFfFc2651A0B22c1B877e')
  },

  'Call web3.eth.getAccounts() using Injected Provider (Metamask) #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
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
