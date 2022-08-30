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
      .click('*[data-id="workspaceCreate"]')
      // create contract
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc721' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc721]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/SampleERC721.sol"]')
      .openFile('contracts/SampleERC721.sol')
      .verifyContracts(['SampleERC721'])
      // deploy contract
      .clickLaunchIcon('udapp')
      .selectContract('SampleERC721')
      .createContract('E,E')
      .testFunction('last',
      {
        status: 'true Transaction mined and execution succeed',
        'decoded input': {
          'string tokenName': 'E',
          'string tokenSymbol': 'E'
        }
      }).end()
  }
}
