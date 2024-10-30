'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const passphrase = process.env.account_passphrase
const password = process.env.account_password
const extension_id = 'nkbihfbeogaeaoehlefnkodbefgpgknn'
const extension_url = `chrome-extension://${extension_id}/home.html`

const checkBrowserIsChrome = function (browser: NightwatchBrowser) {
  return browser.browserName.indexOf('chrome') > -1
}

const checkAlerts = function (browser: NightwatchBrowser) {
  browser.isVisible({
    selector: '//*[contains(.,"not have enough")]',
    locateStrategy: 'xpath',
    suppressNotFoundErrors: true,
    timeout: 3000
  }, (okVisible) => {
    if (okVisible.value) {
      browser.assert.fail('Not enough ETH in test account!!')
      browser.end()
    }
  })
}

const tests = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should connect to Sepolia Test Network using MetaMask #flaky #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .setupMetamask(passphrase, password)
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .clickLaunchIcon('udapp')
      .switchEnvironment('injected-MetaMask')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Sepolia (11155111) network')
      .pause(5000)
      .switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
        browser
          .hideMetaMaskPopup()
          .waitForElementVisible('*[data-testid="page-container-footer-next"]', 60000)
          .click('*[data-testid="page-container-footer-next"]') // this connects the metamask account to remix
          .pause(2000)
          .waitForElementVisible('*[data-testid="page-container-footer-next"]', 60000)
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
      .clearConsole()
      .perform((done) => {
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          checkAlerts(browser)
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
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
      .clearConsole()
      .waitForElementPresent('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .click('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .perform((done) => {
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            .saveScreenshot('./reports/screenshots/metamask_tr1.png')
            .pause(3000)
            .scrollAndClick('[data-testid="page-container-footer-next"]')
            //.waitForElementPresent('[data-testid="page-container-footer-next"]')
            .saveScreenshot('./reports/screenshots/metamask_tr2.png')
            .pause(2000)
            //.click('[data-testid="page-container-footer-next"]') // approve the tx
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'transact to Helloworld', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'fallback', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .saveScreenshot('./reports/screenshots/metamask_tr3.png')
            .perform(() => done())
        })
      })
  },
  'Should deploy faulty contract on Sepolia Test Network using MetaMask and show error in terminal #group1': function (browser: NightwatchBrowser) {
    browser
      .clearConsole()
      .clickLaunchIcon('filePanel')
      .addFile('faulty.sol', sources[0]['faulty.sol'])
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(5000)
      .saveScreenshot('./reports/screenshots/metamask_7.png')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalBody-react"]', 60000)
      .click('[data-id="udappNotify-modal-footer-cancel-react"]')
      .saveScreenshot('./reports/screenshots/metamask_8.png')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: "//span[@class='text-log' and contains(., 'errored')]"
      })
  },
  'Should deploy contract on Sepolia Test Network using MetaMask again #group1': function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser.clearConsole().waitForElementPresent('*[data-id="runTabSelectAccount"] option', 45000)
      .clickLaunchIcon('filePanel')
      .openFile('Greet.sol')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(5000)
      .clearConsole()
      .perform((done) => {
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          checkAlerts(browser)
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            .waitForElementPresent('[data-testid="page-container-footer-next"]')
            .click('[data-testid="page-container-footer-next"]') // approve the tx
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .perform(() => done())
        })
      })
  }
}

const branch = process.env.CIRCLE_BRANCH
const runTestsConditions = (branch === 'master' || branch === 'remix_live' || branch.includes('remix_beta') || branch.includes('metamask'))

if (!checkBrowserIsChrome(browser)) {
  module.exports = {}
} else {
  module.exports = {
    ...(branch ? (runTestsConditions ? tests : {}) : tests)
  };
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
    'faulty.sol': {
      content: `// SPDX-License-Identifier: GPL-3.0

      pragma solidity >=0.8.2 <0.9.0;

      contract Test {
          error O_o(uint256);
          constructor() {
              revert O_o(block.timestamp);
          }
      }`
    }
  }
]
