'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?activate=solidity,udapp&call=fileManager//open//contracts/3_Ballot.sol&deactivate=home', false)
  },

  CheckSolidityActivatedAndUDapp: function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('#icon-panel', 10000)
      .clickLaunchIcon('solidity')
      .clickLaunchIcon('udapp')
  },

  'Editor should be focused on the 3_Ballot.sol': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .refresh()
      .pause(2000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('contract Ballot {') !== -1, 'content doesn\'t include Ballot contract')
      })
  },

  'Home page should be deactivated': function (browser: NightwatchBrowser) {
    browser
      .waitForElementNotPresent('[data-id="landingPageHomeContainer"]')
  },

  'Should create two workspace and switch to the first one': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('fileExplorers')
      .click('*[data-id="workspaceCreate"]') // create workspace_name
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_name' })
      .click('*[data-id="workspacesModalDialogModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .addFile('test.sol', { content: 'test' })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .click('*[data-id="workspaceCreate"]') // create workspace_name_1
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_name_1' })
      .click('*[data-id="workspacesModalDialogModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .click('*[data-id="workspacesSelect"] option[value="workspace_name"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
  },

  'Should rename a workspace': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceRename"]') // rename workspace_name
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextRename"]')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextRename"]')['value'] = 'workspace_name_renamed' })
      .click('*[data-id="workspacesModalDialogModalDialogModalFooter-react"] .modal-ok')
      .click('*[data-id="workspacesSelect"] option[value="workspace_name_1"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .click('*[data-id="workspacesSelect"] option[value="workspace_name_renamed"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
  },

  'Should delete a workspace': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspacesSelect"] option[value="workspace_name_1"]')
      .click('*[data-id="workspaceDelete"]') // delete workspace_name_1
      .waitForElementVisible('*[data-id="workspacesModalDialogModalDialogModalFooter-react"] .modal-ok')
      .click('*[data-id="workspacesModalDialogModalDialogModalFooter-react"] .modal-ok')
      .waitForElementNotPresent('*[data-id="workspacesSelect"] option[value="workspace_name_1"]')
      .end()
  },

  tearDown: sauce
}
