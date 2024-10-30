'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/example-contracts'

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

const localsCheck = {
  to: {
    value: '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB',
    type: 'address'
  }
}

const tests = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should connect to Sepolia Test Network using MetaMask #group4 #group3 #group2 #group1': function (browser: NightwatchBrowser) {
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
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .addFile('Greet.sol', sources[0]['Greet.sol'])
      .clickLaunchIcon('udapp')
      .waitForElementVisible('*[data-id="Deploy - transact (not payable)"]', 45000) // wait for the contract to compile
  },

  'Should deploy contract on Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
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
            .waitForElementVisible({
              locateStrategy: 'xpath',
              selector: "//span[@class='text-log' and contains(., 'transact to HelloWorld.(fallback) pending')]"
            })
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .saveScreenshot('./reports/screenshots/metamask_tr3.png')
            .perform(() => done())
        })
      })
  },
  'Should run transaction (greet function) on Sepolia Test Network using MetaMask #group1': function (browser: NightwatchBrowser) {
    browser.clearConsole().waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .clearConsole()
      .waitForElementPresent('*[data-title="string _message"]')
      .setValue('*[data-title="string _message"]', 'test')
      .saveScreenshot('./reports/screenshots/metamask_tr7.png')
      .waitForElementVisible('*[data-id="greet - transact (not payable)"]')
      .saveScreenshot('./reports/screenshots/metamask_tr9.png')
      .click('*[data-id="greet - transact (not payable)"]')
      .saveScreenshot('./reports/screenshots/metamask_tr8.png')
      .perform((done) => {
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            .saveScreenshot('./reports/screenshots/metamask_tr4.png')
            .pause(3000)
            .scrollAndClick('[data-testid="page-container-footer-next"]')
            //.waitForElementPresent('[data-testid="page-container-footer-next"]')
            .saveScreenshot('./reports/screenshots/metamask_tr5.png')
            .pause(2000)
            //.click('[data-testid="page-container-footer-next"]') // approve the tx
            .switchBrowserTab(0) // back to remix
            .waitForElementVisible({
              locateStrategy: 'xpath',
              selector: "//span[@class='text-log' and contains(., 'transact to HelloWorld.greet pending')]"
            })
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .saveScreenshot('./reports/screenshots/metamask_tr6.png')
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

  // main network tests
  'Should connect to Ethereum Main Network using MetaMask #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .switchBrowserTab(1)
      .click('[data-testid="network-display"]')
      .click('div[data-testid="Ethereum Mainnet"]') // switch to mainnet
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .clickLaunchIcon('udapp')
      .switchEnvironment('injected-MetaMask')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Main (1) network')
  },

  'Should deploy contract on Ethereum Main Network using MetaMask #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="runTabSelectAccount"] option')
      .clickLaunchIcon('filePanel')
      .addFile('Greet.sol', sources[0]['Greet.sol'])
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalBody-react"]', 65000)
      .modalFooterOKClick('udappNotify')
      .pause(10000)
      .assert.containsText('*[data-id="udappNotifyModalDialogModalBody-react"]', 'You are about to create a transaction on Main Network. Confirm the details to send the info to your provider.')
      .modalFooterCancelClick('udappNotify')
  },
  // debug transaction
  'Should deploy Ballot to Sepolia using metamask #group3 #flaky': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .switchBrowserTab(1)
      .click('[data-testid="network-display"]')
      .click('div[data-testid="Sepolia"]') // switch to sepolia
      .useCss().switchBrowserTab(0)
      .addFile('BallotTest.sol', examples.ballot)
      .clickLaunchIcon('udapp')
      .clearConsole()
      .clearTransactions()
      .clickLaunchIcon('udapp')
      .waitForElementVisible('input[placeholder="bytes32[] proposalNames"]')
      .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
      .click('*[data-id="Deploy - transact (not payable)"]') // deploy ballot
      .pause(5000)
      .perform((done) => {
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            .saveScreenshot('./reports/screenshots/metamask_4.png')
            .pause(3000)
            .scrollAndClick('[data-testid="page-container-footer-next"]')
            .click('[data-testid="page-container-footer-next"]') // approve the tx
            .pause(2000)
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .saveScreenshot('./reports/screenshots/metamask_5.png')
            .perform(() => done())
        })
      })
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .clearConsole()
      .clickInstance(0)
      .clickFunction('delegate - transact (not payable)', { types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"' })
      .saveScreenshot('./reports/screenshots/metamask_6.png')
      .pause(5000)
      .perform((done) => { // call delegate
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            
            .pause(5000)
            .saveScreenshot('./reports/screenshots/metamask_7.png')
            .scrollAndClick('[data-testid="page-container-footer-next"]')
            // .click('[data-testid="page-container-footer-next"]') // approve the tx
            .pause(2000)
            .saveScreenshot('./reports/screenshots/metamask_8.png')
            .switchBrowserTab(0) // back to remix
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'view on etherscan', 60000)
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'from: 0x76a...2708f', 60000)
            .perform(() => done())
        })
      })
      //.testFunction('last',
      //  {
      //    status: '0x1 Transaction mined and execution succeed',
      //    'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      //  })
  },
  'Should debug Sepolia transaction with source highlighting MetaMask #group3': !function (browser: NightwatchBrowser) {
    let txhash
    browser.waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('pluginManager') // load debugger and source verification
      // .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_sourcify"] button')
      // debugger already activated .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
      .clickLaunchIcon('udapp')
      .perform((done) => {
        browser.getLastTransactionHash((hash) => {
          txhash = hash
          done()
        })
      })
      .perform((done) => {
        browser
          .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
          .clickLaunchIcon('debugger')
          .setValue('*[data-id="debuggerTransactionInput"]', txhash) // debug tx
          .saveScreenshot('./reports/screenshots/metamask_debug.png')
          .saveScreenshot('./reports/screenshots/metamask_2.png')
          .click('*[data-id="debuggerTransactionStartButton"]')
          .saveScreenshot('./reports/screenshots/metamask_3.png')
          .waitForElementVisible('*[data-id="treeViewDivto"]', 30000)
          .checkVariableDebug('soliditylocals', localsCheck)
          .perform(() => done())
      })

  },
  'Call web3.eth.getAccounts() using Injected Provider (Metamask) #group4': !function (browser: NightwatchBrowser) {
    if (!checkBrowserIsChrome(browser)) return
    browser
      .executeScriptInTerminal('web3.eth.getAccounts()')
      .journalLastChildIncludes('["0x76a3ABb5a12dcd603B52Ed22195dED17ee82708f"]')
  },

  'Test EIP 712 Signature with Injected Provider (Metamask) #group4': !function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('i[id="remixRunSignMsg"]')
      .click('i[id="remixRunSignMsg"]')
      .waitForElementVisible('*[data-id="signMessageTextarea"]', 120000)
      .click('*[data-id="sign-eip-712"]')
      .waitForElementVisible('*[data-id="udappNotify-modal-footer-ok-react"]')
      .modalFooterOKClick('udappNotify')
      .pause(1000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('"primaryType": "AuthRequest",') !== -1, 'EIP 712 data file must be opened')
      })
      .clickLaunchIcon('filePanel')
      .rightClick('li[data-id="treeViewLitreeViewItemEIP-712-data.json"]')
      .click('*[data-id="contextMenuItemsignTypedData"]')
      .pause()
      .perform((done) => { // call delegate
        browser.switchBrowserWindow(extension_url, 'MetaMask', (browser) => {
          browser
            .maximizeWindow()
            .hideMetaMaskPopup()
            .saveScreenshot('./reports/screenshots/metamask_6.png')
            .waitForElementPresent('button[aria-label="Scroll down"]', 60000)
            .click('button[aria-label="Scroll down"]') // scroll down
            .click('button[data-testid="confirm-footer-button"]') // confirm
            .switchBrowserTab(0) // back to remix
            .perform(() => done())
        })
      })
      .pause(1000)
      .journalChildIncludes('0x8be3a81e17b7e4a40006864a4ff6bfa3fb1e18b292b6f47edec95cd8feaa53275b90f56ca02669d461a297e6bf94ab0ee4b7c89aede3228ed5aedb59c7e007501c')
  }
}

const branch = process.env.CIRCLE_BRANCH
const runTestsConditions = branch && (branch === 'master' || branch === 'remix_live' || branch.includes('remix_beta') || branch.includes('metamask'))

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
