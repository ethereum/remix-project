'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')
const path = require('path')
const testData = {
  testFile1: path.resolve(__dirname + '/editor.js'), // eslint-disable-line
  testFile2: path.resolve(__dirname + '/fileExplorer.js'), // eslint-disable-line
  testFile3: path.resolve(__dirname + '/generalSettings.js') // eslint-disable-line
}

module.exports = {

  before: function (browser, done) {
    init(browser, done)
  },

  'Should create a new file `5_New_contract.sol` in file explorer': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .clickLaunchIcon('fileExplorers')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORERS')
    .click('*[data-id="fileExplorerNewFilecreateNewFile"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', '5_New_contract.sol')
    .modalFooterOKClick()
    .pause(2000)
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_New_contract.sol"]')
  },

  'Should rename `5_New_contract.sol` to 5_Renamed_Contract.sol': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_New_contract.sol"]')
    .rightClick('[data-path="browser/5_New_contract.sol"]')
    .click('*[id="menuitemrename"]')
    .sendKeys('[data-path="browser/5_New_contract.sol"]', '5_Renamed_Contract.sol')
    .sendKeys('[data-path="browser/5_New_contract.sol"]', browser.Keys.ENTER)
    .keys()
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"]')
  },

  'Should delete file `5_Renamed_Contract.sol` from file explorer': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"]')
    .rightClick('[data-path="browser/5_Renamed_Contract.sol"]')
    .click('*[id="menuitemdelete"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"')
  },

  'Should create a new folder': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/1_Storage.sol"]')
    .rightClick('[data-path="browser/1_Storage.sol"]')
    .click('*[id="menuitemcreate folder"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', 'Browser_Tests')
    .modalFooterOKClick()
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
  },

  'Should rename Browser_Tests folder to Browser_E2E_Tests': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
    .rightClick('[data-path="browser/Browser_Tests"]')
    .click('*[id="menuitemrename"]')
    .sendKeys('[data-path="browser/Browser_Tests"]', 'Browser_E2E_Tests')
    .sendKeys('[data-path="browser/Browser_Tests"]', browser.Keys.ENTER)
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
  },

  'Should delete Browser_E2E_Tests folder': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
    .rightClick('[data-path="browser/Browser_E2E_Tests"]')
    .click('*[id="menuitemdelete"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
  },

  'Should publish all explorer files to github gist': function (browser) {
    const runtimeBrowser = browser.capabilities.browserName

    browser
    .waitForElementVisible('*[data-id="fileExplorerNewFilepublishToGist"]')
    .click('*[data-id="fileExplorerNewFilepublishToGist"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .pause(10000)
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
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

  'Should open local filesystem explorer': function (browser) {
    browser.waitForElementVisible('*[data-id="filePanelFileExplorerTree"]')
    .setValue('*[data-id="fileExplorerFileUpload"]', testData.testFile1)
    .setValue('*[data-id="fileExplorerFileUpload"]', testData.testFile2)
    .setValue('*[data-id="fileExplorerFileUpload"]', testData.testFile3)
    .waitForElementVisible('*[key="browser/editor.js"]')
    .waitForElementVisible('*[key="browser/fileExplorer.js"]')
    .waitForElementVisible('*[key="browser/generalSettings.js"]')
    .end()
  },

  tearDown: sauce
}
