'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import * as path from 'path'

const testData = {
  testFile1: path.resolve(__dirname + '/editor.test.js'), // eslint-disable-line
  testFile2: path.resolve(__dirname + '/fileExplorer.test.js'), // eslint-disable-line
  testFile3: path.resolve(__dirname + '/generalSettings.test.js') // eslint-disable-line
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should create a new file `5_New_contract.sol` in file explorer #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORER')
      .click('li[data-id="treeViewLitreeViewItemREADME.txt"]') // focus on root directory
      .click('*[data-id="fileExplorerNewFilecreateNewFile"]')
      .pause(1000)
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', '5_New_contract.sol')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem5_New_contract.sol"]', 7000)
  },

  'Should rename `5_New_contract.sol` to 5_Renamed_Contract.sol #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem5_New_contract.sol"]')
      .click('*[data-id="treeViewLitreeViewItem5_New_contract.sol"]')
      .renamePath('5_New_contract.sol', '5_Renamed_Contract', '5_Renamed_Contract.sol')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem5_Renamed_Contract.sol"]')
  },

  'Should delete file `5_Renamed_Contract.sol` from file explorer #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem5_Renamed_Contract.sol"]')
      .removeFile('5_Renamed_Contract.sol', 'default_workspace')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItem5_Renamed_Contract.sol"')
  },

  'Should create a new folder #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemREADME.txt"]')
      .click('li[data-id="treeViewLitreeViewItemREADME.txt"]') // focus on root directory
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .pause(1000)
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'Browser_Tests')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemBrowser_Tests"]')
  },

  'Should rename Browser_Tests folder to Browser_E2E_Tests #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemBrowser_Tests"]')
      .click('*[data-id="treeViewLitreeViewItemBrowser_Tests"]')
      .renamePath('Browser_Tests', 'Browser_E2E_Tests', 'Browser_E2E_Tests')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemBrowser_E2E_Tests"]')
  },

  'Should delete Browser_E2E_Tests folder #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemBrowser_E2E_Tests"]')
      .rightClickCustom('[data-path="Browser_E2E_Tests"]')
      .click('*[id="menuitemdelete"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok', 60000)
      .pause(2000)
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemBrowser_E2E_Tests"]')
  },

  'Should publish all explorer files to github gist': '' + function (browser: NightwatchBrowser) {
    const runtimeBrowser = browser.options.desiredCapabilities.browserName

    browser.refreshPage()
      .pause(10000)
      .waitForElementVisible('*[data-id="fileExplorerNewFilepublishToGist"]')
      .click('*[data-id="fileExplorerNewFilepublishToGist"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok', 60000)
      .pause(2000)
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .pause(2000)
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok', 60000)
      .pause(2000)
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .pause(2000)
      .perform((done) => {
        if (runtimeBrowser === 'chrome') {
          browser.switchBrowserTab(1)
            .assert.urlContains('https://gist.github.com')
            .switchBrowserTab(0)
        }
        done()
      })
  },

  'Should open local filesystem explorer #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('div[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="filePanelFileExplorerTree"]')
      .click('[data-id="remixUIWorkspaceExplorer"]')
      .waitForElementPresent('*[data-id="fileExplorerFileUpload"]')
      .uploadFile('*[data-id="fileExplorerFileUpload"]', testData.testFile1)
      .uploadFile('*[data-id="fileExplorerFileUpload"]', testData.testFile2)
      .uploadFile('*[data-id="fileExplorerFileUpload"]', testData.testFile3)
      .waitForElementVisible('[data-id="treeViewLitreeViewItemeditor.test.js"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemfileExplorer.test.js"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemgeneralSettings.test.js"]')
      .end()
  },

  'Should add deep tree with buttons #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('div[data-id="remixIdeSidePanel"]')
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="filePanelFileExplorerTree"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep1')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep1"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep2')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep1/deep2"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep3')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep1/deep2/deep3"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFile"]')
      .click('[data-id="fileExplorerNewFilecreateNewFile"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep4.sol')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep1/deep2/deep3/deep4.sol"]')
    // click on root to focus
      .click('li[data-id="treeViewLitreeViewItemREADME.txt"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep5')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep5"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep6')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemdeep5/deep6"]')
    // focus on contracts
      .click('li[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep7')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/deep7"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep8')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/deep7/deep8"]')
      .waitForElementVisible('[data-id="fileExplorerNewFilecreateNewFile"]')
      .click('[data-id="fileExplorerNewFilecreateNewFile"]')
      .waitForElementVisible('*[data-id$="fileExplorerTreeItemInput"]')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', 'deep9.sol')
      .sendKeys('*[data-id$="fileExplorerTreeItemInput"]', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/deep7/deep8/deep9.sol"]')
      .end()
  }

}
