'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const sources = []

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Deploy SampleERC721 whose bytecode is very similar to ERC721': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('filePanel')
      .click('*[data-id="workspacesMenuDropdown"]')
      .click('*[data-id="workspacecreate"]')
      // create contract
      .waitForElementPresent('*[data-id="create-hashchecker"]')
      .scrollAndClick('*[data-id="create-ozerc721"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .scrollAndClick('*[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_erc721')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc721' })
      .modalFooterOKClick('TemplatesSelection')
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .openFile('contracts/MyToken.sol')
      // because the compilatiom imports are slow and sometimes stop loading (not sure why, it's bug) we need to recompile and check to see if the files are really in de FS
      .clickLaunchIcon('solidity')
      .pause(2000)
      .click('[data-id="compilerContainerCompileBtn"]')
      .clickLaunchIcon('filePanel')
      .isVisible({
        selector: '*[data-id="treeViewLitreeViewItem.deps/npm/@openzeppelin/contracts/utils/introspection/IERC165.sol"]',
        timeout: 120000,
        suppressNotFoundErrors: true
      })
      .clickLaunchIcon('solidity')
      .click('[data-id="compilerContainerCompileBtn"]')
      .clickLaunchIcon('filePanel')
      .isVisible({
        selector: '*[data-id="treeViewLitreeViewItem.deps/npm/@openzeppelin/contracts/utils/introspection/IERC165.sol"]',
        timeout: 120000,
        suppressNotFoundErrors: true
      })
      .clickLaunchIcon('solidity')
      .click('[data-id="compilerContainerCompileBtn"]')
      .clickLaunchIcon('filePanel')
      .waitForElementVisible({
        selector: '*[data-id="treeViewLitreeViewItem.deps/npm/@openzeppelin/contracts/utils/introspection/IERC165.sol"]',
        timeout: 120000,
      })
      .verifyContracts(['MyToken'])
      // deploy contract
      .clickLaunchIcon('udapp')
      .selectContract('MyToken')
      .createContract('')
      .testFunction('last',
      {
        status: '0x1 Transaction mined and execution succeed',
        'decoded input': {}
      }).end()
  }
}
