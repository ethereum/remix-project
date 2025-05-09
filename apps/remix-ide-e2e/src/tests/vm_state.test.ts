'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

const tests = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null)
  },

  'Should show fork and delete VM state icons #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .waitForElementVisible('*[data-id="selected-provider-vm-prague"]', 30000)
      .waitForElementVisible('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-id="delete-state-icon"]')
  },
  'Should show toaster while trying fork and delete VM state without state #group1': '' + function (browser: NightwatchBrowser) {
    // removing this test as now the state contains the created addresses and is not empty...
    browser
      .waitForElementVisible('*[data-id="fork-state-icon"]')
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible(
        {
          selector: "//*[@data-shared='tooltipPopup' and contains(.,'State not available to fork')]",
          locateStrategy: 'xpath'
        }
      )
      .waitForElementVisible('*[data-id="delete-state-icon"]')
      .click('*[data-id="delete-state-icon"]')
      .waitForElementVisible(
        {
          selector: "//*[@data-shared='tooltipPopup' and contains(.,'State not available to reset')]",
          locateStrategy: 'xpath'
        }
      )
  },
  'Should fork state successfully #group1': function (browser: NightwatchBrowser) {
    let contractAddress = ''
    browser
      .openFile('contracts')
      .openFile('contracts/1_Storage.sol')
      .verifyContracts(['Storage'])
      .clickLaunchIcon('udapp')
      .click('[data-id="Deploy - transact (not payable)"]')
      .clickInstance(0)
      .perform((done) => {
        browser.getAddressAtPosition(0, (address) => {
          contractAddress = address
          done()
        })
      })      
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '"55"' })
      .testFunction('last',
        {
          status: '0x1 Transaction mined and execution succeed',
          'decoded input': { 'uint256 num': '55' }
        })
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          'decoded output': { '0': 'uint256: 55' }
        })
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalTitle-react"]')
      .click('input[data-id="modalDialogForkState"]')
      .setValue('input[data-id="modalDialogForkState"]', 'forkedState_1')
      .modalFooterOKClick('udappNotify')
      // check toaster for forked state
      .waitForElementVisible(
        {
          selector: '//*[@data-shared="tooltipPopup" and contains(.,"New environment \'forkedState_1\' created with forked state.")]',
          locateStrategy: 'xpath'
        }
      )
      // check if forked state is selected as current environment
      .assert.elementPresent('*[data-id="selected-provider-vm-fs-forkedState_1"]')
      // check if forked state file is created with expected details
      .openFile('.states/forked_states/forkedState_1.json')
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`"latestBlockNumber": "0x2"`) !== -1)
        browser.assert.ok(content.indexOf(`"stateName": "forkedState_1"`) !== -1)
        browser.assert.ok(content.indexOf(`"forkName": "prague"`) !== -1)
        browser.assert.ok(content.indexOf(`"savingTimestamp":`) !== -1)
        browser.assert.ok(content.indexOf(`"db":`) !== -1)
        browser.assert.ok(content.indexOf(`"blocks":`) !== -1)
      })
      // fork again this state. The name of the new forked state will be sub_forkedState_2
      .clickLaunchIcon('udapp')
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalTitle-react"]')
      .click('input[data-id="modalDialogForkState"]')
      .setValue('input[data-id="modalDialogForkState"]', 'sub_forkedState_2')
      .modalFooterOKClick('udappNotify')
      // load the previous contract
      .clickLaunchIcon('filePanel')
      .openFile('contracts/1_Storage.sol')
      .perform((done) => {
        browser.addAtAddressInstance(contractAddress, true, true, false)
        .perform(() => done())
      })
      .clickInstance(0)
      // check that the state is correct
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          'decoded output': { '0': 'uint256: 55' }
        })
      // update the state and check it's correctly applied
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '"57"' })
      .testFunction('last',
        {
          status: '0x1 Transaction mined and execution succeed',
          'decoded input': { 'uint256 num': '57' }
        })
      .clearConsole()
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          'decoded output': { '0': 'uint256: 57' }
        })
      // switch back to the previous state and check the value hasn't changed.
      .switchEnvironment('vm-fs-forkedState_1')
      .clickLaunchIcon('filePanel')
      .openFile('contracts/1_Storage.sol')
      .perform((done) => {
        browser.addAtAddressInstance(contractAddress, true, true, false)
        .perform(() => done())
      })
      .clickInstance(0)
      .clearConsole()
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          'decoded output': { '0': 'uint256: 55' }
        })
      .clickLaunchIcon('filePanel')
  },
  'Should show fork states provider in environment explorer & make txs using forked state #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
      .click('[data-id="settingsSelectEnvOptions"] button')
      .waitForElementVisible(`[data-id="dropdown-item-another-chain"]`)
      .click(`[data-id="dropdown-item-another-chain"]`)
      .waitForElementVisible('[data-id="remixUIGSDeploy to an In-browser Forked State."]')
      .waitForElementPresent('[data-id="remixUIGSforkedState_1"]')
      .waitForElementPresent('[data-id="vm-fs-forkedState_1-pinned"]')
      .waitForElementContainsText('[data-id="vm-fs-forkedState_1desc"]', 'Latest Block: 2')
      .waitForElementNotPresent('[data-id="remixUIGSforkedState_2"]')
      .switchEnvironment('vm-prague')
      .openFile('contracts/1_Storage.sol')
      .verifyContracts(['Storage'])
      .clickLaunchIcon('udapp')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementVisible('*[data-id="unpinnedInstance0xf8e81D47203A594245E36C48e151709F0C19fBe8"]')
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalTitle-react"]')
      .click('input[data-id="modalDialogForkState"]')
      .setValue('input[data-id="modalDialogForkState"]', 'forkedState_2')
      .modalFooterOKClick('udappNotify')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 10000)
      .waitForElementContainsText('*[data-shared="tooltipPopup"]', `New environment 'forkedState_2' created with forked state.`)
      // check if 'forkedState_2' is selected as current environment 
      .waitForElementPresent('*[data-id="selected-provider-vm-fs-forkedState_2"]')
      // check if 'forkedState_2' is present in environment explorer
      .waitForElementPresent('[data-id="remixUIGSforkedState_2"]')
      // check if 'forkedState_2' is pinned in environment explorer
      .waitForElementPresent('[data-id="vm-fs-forkedState_2-pinned"]')
      // 'forkedState_2' should have 3 blocks
      .waitForElementContainsText('[data-id="vm-fs-forkedState_2desc"]', 'Latest Block: 3')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .clickInstance(0)
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '"555"' })
      // block number should be 5 after 2 txs
      .testFunction('last',
        {
          status: '0x1 Transaction mined and execution succeed',
          'block number': '5',
          'decoded input': { 'uint256 num': '555' }
        })
  },
  'Should delete state successfully #group1': function (browser: NightwatchBrowser) {
    browser
      .switchEnvironment('vm-prague')
      .openFile('contracts/1_Storage.sol')
      .verifyContracts(['Storage'])
      .clickLaunchIcon('udapp')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .pause(10000)
      .assert.textContains('*[data-id="deployedContractsBadge"]', '1')
      .click(('*[data-id="delete-state-icon"]'))
      .waitForElementVisible('*[data-id="udappNotifyModalDialogModalTitle-react"]')
      .waitForElementVisible('*[data-id="deleteVmStateModal"]')
      .modalFooterOKClick('udappNotify')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 10000)
      // check if toaster is shown
      .assert.textContains('*[data-shared="tooltipPopup"]', `VM state reset successfully.`)
      // check that there are no instances
      .assert.textContains('*[data-id="deployedContractsBadge"]', '0')
      // check if state file is deleted
      .openFile('.states/vm-prague')
      .assert.not.elementPresent('*[data-id="treeViewDivDraggableItem.states/vm-prague/state.json"]')
  }
}

module.exports = {
  ...tests
};
