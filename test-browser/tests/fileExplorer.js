'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

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
    .moveToElement('*[data-id="treeViewLibrowser/5_New_contract.sol"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemrename"]')
    .keys('5_Renamed_Contract.sol')
    .keys(browser.Keys.ENTER)
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"]')
  },

  'Should delete file `5_Renamed_Contract.sol` from file explorer': function (browser) {
    browser
    .moveToElement('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemdelete"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/5_Renamed_Contract.sol"')
  },

  'Should create a new folder': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/1_Storage.sol"]')
    .moveToElement('*[data-id="treeViewLibrowser/1_Storage.sol"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemcreate folder"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', 'Browser_Tests')
    .modalFooterOKClick()
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
  },

  'Should rename Browser_Tests folder to Browser_E2E_Tests': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
    .moveToElement('*[data-id="treeViewLibrowser/Browser_Tests"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemrename"]')
    .keys('Browser_E2E_Tests')
    .keys(browser.Keys.ENTER)
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
  },

  'Should delete Browser_E2E_Tests folder': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
    .moveToElement('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemdelete"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/Browser_E2E_Tests"]')
  },

  'Should publish all explorer files to github gist': function (browser) {
    browser
    .waitForElementVisible('*[data-id="fileExplorerNewFilepublishToGist"]')
    .click('*[data-id="fileExplorerNewFilepublishToGist"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .pause(10000)
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .pause(2000)
    .switchBrowserTab(1)
    .assert.urlContains('https://gist.github.com')
    .end()
  },

  tearDown: sauce
}
