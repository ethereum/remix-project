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
      .assert.not.hasClass('*[data-id="universalDappUiUdappPin"]', 'text-success')
      .click('*[data-id="universalDappUiUdappPin"]')
      .assert.elementPresent('*[data-id="deployAndRunNoInstanceText"]')
      .assert.textContains('*[data-id="deployAndRunNoInstanceText"]', 'Currently you have no unpinned contracts to interact with.')
      .assert.not.elementPresent('*[data-id="NoPinnedInstanceText"]')
      .assert.elementPresent('*[data-id="pinnedInstance0xd9145CCE52D386f254917e481eB44e9943F39138"]')
      .assert.hasClass('*[data-id="universalDappUiUdappUnpin"]', 'text-success')
    },
}