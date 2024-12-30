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
      .waitForElementVisible('*[data-id="selected-provider-vm-cancun"]')
      .waitForElementVisible('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-id="delete-state-icon"]')
  },
  'Should show toaster while trying fork and delete VM state without state #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="fork-state-icon"]')
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible(
        {
          selector: "//*[@data-shared='tooltipPopup' and contains(.,'State not available to fork')]",
          locateStrategy: 'xpath'
        }
      )
  }
  ,
  'Should fork state successfully #group1': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts')
      .openFile('contracts/1_Storage.sol')
      .verifyContracts(['Storage'])
      .clickLaunchIcon('udapp')
      .click('[data-id="Deploy - transact (not payable)"]')
      .clickInstance(0)
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
      // check tooltip for forked state
      .waitForElementVisible(
        {
          selector: '//*[@data-shared="tooltipPopup" and contains(.,"VM state \'forkedState_1\' forked")]',
          locateStrategy: 'xpath'
        }
      )  // check if forked state is selected as current envionment
      .waitForElementVisible('*[data-id="selected-provider-vm-fs-forkedState_1"]')
      // check if forked state file is created with expected details
      .openFile('.states/forked_states/forkedState_1.json')
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`"latestBlockNumber": "0x2"`) !== -1)
        browser.assert.ok(content.indexOf(`"stateName": "forkedState_1"`) !== -1)
        browser.assert.ok(content.indexOf(`"forkName": "cancun"`) !== -1)
        browser.assert.ok(content.indexOf(`"savingTimestamp":`) !== -1)
        browser.assert.ok(content.indexOf(`"db":`) !== -1)
        browser.assert.ok(content.indexOf(`"blocks":`) !== -1)
      })
  },
}

module.exports = {
  ...tests
};
