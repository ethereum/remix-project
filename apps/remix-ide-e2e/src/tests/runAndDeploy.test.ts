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

  'Should load run and deploy tab #group1 #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="sidePanelSwapitTitle"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEPLOY & RUN TRANSACTIONS')
  },

  'Should load run and deploy tab and check value validation #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEPLOY & RUN TRANSACTIONS')
      .validateValueInput('*[data-id="dandrValue"]', ['9','9','9'], '999')
      .validateValueInput('*[data-id="dandrValue"]', ['0','0','0'], '0')
      .validateValueInput('*[data-id="dandrValue"]', ['1','.','3'], '0') // no decimal
      // .validateValueInput('*[data-id="dandrValue"]', 'dragon', '0') // only numbers
  },

  'Should sign message using account key #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="settingsRemixRunSignMsg"]')
      .switchEnvironment('vm-paris')
      .pause(2000)
      .click('*[data-id="settingsRemixRunSignMsg"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="signMessageTextarea"]', 120000)
      .click('*[data-id="signMessageTextarea"]')
      .setValue('*[data-id="signMessageTextarea"]', 'Remix is cool!')
      .assert.not.elementPresent('*[data-id="settingsRemixRunSignMsgHash"]')
      .assert.not.elementPresent('*[data-id="settingsRemixRunSignMsgSignature"]')
      .pause(2000)
      .waitForElementPresent('[data-id="udappNotify-modal-footer-ok-react"]')
      .click('[data-id="udappNotify-modal-footer-ok-react"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalBody-react"]', 12000)
      .assert.elementPresent('*[data-id="settingsRemixRunSignMsgHash"]')
      .assert.elementPresent('*[data-id="settingsRemixRunSignMsgSignature"]')
      .waitForElementPresent('[data-id="udappNotify-modal-footer-ok-react"]')
      .click('[data-id="udappNotify-modal-footer-ok-react"]')
  },

  'Should deploy contract on JavascriptVM #group3': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .addFile('Greet.sol', sources[0]['Greet.sol'])
      .clickLaunchIcon('udapp')
      .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
      .waitForElementVisible('*[data-id="Deploy - transact (not payable)"]', 45000)
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(5000)
      .testFunction('last', {
        status: '0x1 Transaction mined and execution succeed'
      })
  },

  'Should show and update balance for deployed contract on JavascriptVM #group3': function (browser: NightwatchBrowser) {
    let instanceAddress
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .addFile('checkBalance.sol', sources[0]['checkBalance.sol'])
      .clickLaunchIcon('udapp')
      .setValue('*[data-id="dandrValue"]', '111')
      .waitForElementVisible('*[data-id="Deploy - transact (payable)"]', 45000)
      .click('*[data-id="Deploy - transact (payable)"]')
      .pause(1000)
      .clickInstance(1)
      .pause(1000)
      .getAddressAtPosition(1, (address) => {
        instanceAddress = address
        console.log('instanceAddress', instanceAddress)
        browser
          .waitForElementVisible(`#instance${instanceAddress} [data-id="instanceContractBal"]`)
        //*[@id="instance0xbBF289D846208c16EDc8474705C748aff07732dB" and contains(.,"Balance") and contains(.,'0.000000000000000111')]
          .waitForElementVisible({
            locateStrategy: 'xpath',
            selector: `//*[@id="instance${instanceAddress}" and contains(.,"Balance") and contains(.,'0.000000000000000111')]`,
            timeout: 60000
          })
        //.waitForElementContainsText(`#instance${instanceAddress} [data-id="instanceContractBal"]`, 'Balance: 0.000000000000000111 ETH', 60000)
          .clickFunction('sendSomeEther - transact (not payable)', { types: 'uint256 num', values: '2' })
          .pause(1000)
          .waitForElementVisible({
            locateStrategy: 'xpath',
            selector: `//*[@id="instance${instanceAddress}" and contains(.,"Balance") and contains(.,'0.000000000000000109')]`,
            timeout: 60000
          })
      })
  },

  'Should run low level interaction (fallback function) #group3': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .clickInstance(0)
      .waitForElementPresent('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .click('*[data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"]')
      .pause(5000)
      .testFunction('last', {
        status: '0x1 Transaction mined and execution succeed'
      })
      // When this is removed and tests are running by connecting to metamask
      // Consider adding tests to check return value of contract call
      // See: https://github.com/ethereum/remix-project/pull/1229
      .end()
  },

  'Should connect to Goerli Test Network using MetaMask': !function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .setupMetamask(passphrase, password)
      .click('.network-indicator__down-arrow')
      .useXpath().click("//span[text()='Goerli Test Network']")
      .useCss().switchBrowserTab(0)
      .refreshPage()
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
      .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]')
      .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
      .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Goerli (5) network')
      .switchBrowserTab(2)
      .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
      .click('.page-container__footer-button:nth-of-type(2)')
      .switchBrowserTab(0)
  },

  'Should deploy contract on Goerli Test Network using MetaMask': !function (browser: NightwatchBrowser) {
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

  'Should run low level interaction (fallback function) on Goerli Test Network using MetaMask': !function (browser: NightwatchBrowser) {
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
      .end()
  },

  'Should connect to Ethereum Main Network using MetaMask': !function (browser: NightwatchBrowser) {
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

  'Should deploy contract on Ethereum Main Network using MetaMask': !function (browser: NightwatchBrowser) {
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
  'Should debug Ropsten transaction with source highlighting using the source verifier service and MetaMask': !function (browser: NightwatchBrowser) {
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

  'Call web3.eth.getAccounts() using Injected Provider (Metamask)': !function (browser: NightwatchBrowser) {
    browser
      .executeScriptInTerminal('web3.eth.getAccounts()')
      .journalLastChildIncludes('[ "0x76a3ABb5a12dcd603B52Ed22195dED17ee82708f" ]')
      .end()
  },

  'Should ensure that save environment state is checked by default #group4 #group5': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('settings')
      .waitForElementPresent('[data-id="settingsEnableSaveEnvStateLabel"]')
      .scrollInto('[data-id="settingsEnableSaveEnvStateLabel"]')
      .verify.elementPresent('[data-id="settingsEnableSaveEnvState"]:checked')
  },

  'Should deploy default storage contract; store value and ensure that state is saved. #group4 #group5': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .openFile('contracts/1_Storage.sol')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementPresent('#instance0xd9145CCE52D386f254917e481eB44e9943F39138')
      .clickInstance(0)
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '10' })
      .clickFunction('retrieve - call')
      .waitForElementContainsText('[data-id="treeViewLi0"]', 'uint256: 10')
      .clickLaunchIcon('filePanel')
      .openFile('.states/vm-cancun/state.json')
      .getEditorValue((content) => {
        browser
          .assert.ok(content.includes('"latestBlockNumber": "0x2"'), 'State is saved')
      })
  },

  'Should load state after page refresh #group4': function (browser: NightwatchBrowser) {
    browser.refreshPage()
      .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .openFile('contracts/1_Storage.sol')
      .addAtAddressInstance('0xd9145CCE52D386f254917e481eB44e9943F39138', true, true, false)
      .clickInstance(0)
      .clickFunction('retrieve - call')
      .waitForElementContainsText('[data-id="treeViewLi0"]', 'uint256: 10')
  },

  'Should save state after running web3 script #group4': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('settings')
      .waitForElementPresent('[data-id="settingsTabGenerateContractMetadataLabel"]')
      .click('[data-id="settingsTabGenerateContractMetadataLabel"]')
      .verify.elementPresent('[data-id="settingsTabGenerateContractMetadata"]:checked')
      .clickLaunchIcon('solidity')
      .click('.remixui_compilerConfigSection')
      .setValue('#evmVersionSelector', 'london')
      .click('*[data-id="compilerContainerCompileBtn"]')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .switchEnvironment('vm-london')
      .clickLaunchIcon('filePanel')
      .click('*[data-id="treeViewLitreeViewItemscripts"]')
      .openFile('scripts/deploy_with_web3.ts')
      .click('[data-id="play-editor"]')
      .waitForElementPresent('[data-id="treeViewDivDraggableItem.states/vm-london/state.json"]')
      .click('[data-id="treeViewDivDraggableItem.states/vm-london/state.json"]')
      .pause(100000)
      .getEditorValue((content) => {
        browser
          .assert.ok(content.includes('"latestBlockNumber": "0x1"'), 'State is saved')
      })
  },

  'Should ensure that .states is not updated when save env option is unchecked #group5': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('settings')
      .waitForElementPresent('[data-id="settingsEnableSaveEnvStateLabel"]')
      .click('[data-id="settingsEnableSaveEnvStateLabel"]')
      .verify.elementNotPresent('[data-id="settingsEnableSaveEnvState"]:checked')
      .clickLaunchIcon('filePanel')
      .openFile('contracts/1_Storage.sol')
      .pause(5000)
      .clickLaunchIcon('udapp')
      .waitForElementPresent('*[data-id="Deploy - transact (not payable)"]')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(5000)
      .clickLaunchIcon('filePanel')
      .openFile('.states/vm-cancun/state.json')
      .getEditorValue((content) => {
        browser
          .assert.ok(content.includes('"latestBlockNumber": "0x2"'), 'State is unchanged')
      })
      .end()
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
