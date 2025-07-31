'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should show badge in deployed contracts section #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .assert.elementPresent('*[data-id="deployedContracts"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '0')
  },
  'Deploy & pin contract #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      // .click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .click('*[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
      .waitForElementVisible('*[data-id="compile-action"]')
      .pause(3000)
      .click('[data-id="compile-action"]')
      .clickLaunchIcon('udapp')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .assert.elementPresent('*[data-id="unpinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '1')
      .click('*[data-id="universalDappUiUdappPin"]')
      .assert.elementPresent('*[data-id="universalDappUiUdappUnpin"]')
      .assert.elementPresent('*[data-id="pinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
  },
  'Test pinned contracts loading on environment change #group1': function (browser: NightwatchBrowser) {
    browser
      .switchEnvironment('vm-cancun')
      .assert.elementPresent('*[data-id="deployedContracts"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '0')
      .switchEnvironment('vm-prague')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '1')
      .assert.elementPresent('*[data-id="pinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
  },
  'Test pinned contracts loading on workspace change #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspacesSelect"]')
      .click('*[data-id="workspacecreate"]')
      .waitForElementPresent('*[data-id="create-remixDefault"]')
      .scrollAndClick('*[data-id="create-remixDefault"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .scrollAndClick('*[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_remix_default')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_remix_default' })
      .modalFooterOKClick('TemplatesSelection')
      .clickLaunchIcon('udapp')
      .assert.elementPresent('*[data-id="deployedContracts"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '0')
      .clickLaunchIcon('filePanel')
      .switchWorkspace('default_workspace')
      .currentWorkspaceIs('default_workspace')
      .clickLaunchIcon('udapp')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '1')
      .assert.elementPresent('*[data-id="pinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
  },
  'Interact with pinned contract #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="universalDappUiTitleExpander0"]')
      .assert.elementPresent('*[data-id="instanceContractBal"]')
      .assert.elementPresent('*[data-id="instanceContractPinnedAt"]')
      .assert.elementPresent('*[data-id="instanceContractFilePath"]')
      .assert.textContains('*[data-id="instanceContractFilePath"]', 'default_workspace/contracts/1_Storage.sol')
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          to: 'Storage.retrieve() 0xd9145CCE52D386f254917e481eB44e9943F39138',
          'decoded output': { "0": "uint256: 0" }
        })
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '35' })
      .testFunction('last',
        {
          status: '0x1 Transaction mined and execution succeed',
          'decoded input': { "uint256 num": "35" }
        })
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          to: 'Storage.retrieve() 0xd9145CCE52D386f254917e481eB44e9943F39138',
          'decoded output': { "0": "uint256: 35" }
        })
  },
  'Unpin & interact #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="universalDappUiUdappUnpin"]')
      .assert.not.elementPresent('*[data-id="instanceContractPinnedAt"]')
      .assert.not.elementPresent('*[data-id="instanceContractFilePath"]')
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          to: 'Storage.retrieve() 0xd9145CCE52D386f254917e481eB44e9943F39138',
          'decoded output': { "0": "uint256: 35" }
        })
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '55' })
      .testFunction('last',
        {
          status: '0x1 Transaction mined and execution succeed',
          'decoded input': { "uint256 num": "55" }
        })
      .clickFunction('retrieve - call')
      .testFunction('last',
        {
          to: 'Storage.retrieve() 0xd9145CCE52D386f254917e481eB44e9943F39138',
          'decoded output': { "0": "uint256: 55" }
        })
  },
  'Re-pin & remove from list #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="universalDappUiUdappPin"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '1')
      .click('*[data-id="universalDappUiUdappClose"]')
      .assert.textContains('*[data-id="deployedContractsBadge"]', '0')
  },
}
