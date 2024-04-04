'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should show text in pinned contracts section #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .assert.elementPresent('*[data-id="pinnedContracts"]')
      .assert.textContains('*[data-id="pinnedContractsSublabel"]', '(VM: vm-cancun)')
      .assert.elementPresent('*[data-id="NoPinnedInstanceText"]')
      .assert.textContains('*[data-id="NoPinnedInstanceText"]', 'No pinned contracts found for selected workspace & network')
  },
  'Deploy & pin contract #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .click('*[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
      .clickLaunchIcon('udapp')
      .click('*[data-id="Deploy - transact (not payable)"]')
      .assert.elementPresent('*[data-id="unpinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
      .click('*[data-id="universalDappUiUdappPin"]')
      .assert.elementPresent('*[data-id="deployAndRunNoInstanceText"]')
      .assert.textContains('*[data-id="deployAndRunNoInstanceText"]', 'Currently you have no unpinned contracts to interact with.')
      .assert.not.elementPresent('*[data-id="NoPinnedInstanceText"]')
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
      .assert.textContains('*[data-id="NoPinnedInstanceText"]', 'No pinned contracts found for selected workspace & network')
      .assert.not.elementPresent('*[data-id="deployAndRunNoInstanceText"]')
      .click('*[data-id="universalDappUiTitleExpander0"]')
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
  'Re-pin & delete immediately #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="universalDappUiUdappPin"]')
      .assert.elementPresent('*[data-id="deployAndRunNoInstanceText"]')
      .click('*[data-id="universalDappUiUdappDelete"]')
      .assert.textContains('*[data-id="NoPinnedInstanceText"]', 'No pinned contracts found for selected workspace & network')
      .assert.textContains('*[data-id="deployAndRunNoInstanceText"]', 'Currently you have no unpinned contracts to interact with.')
    },
}