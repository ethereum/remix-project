'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {

  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should create a new file `5_New_contract.sol` in file explorer': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORERS')
    .click('*[data-id="fileExplorerNewFilecreateNewFile"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', '5_New_contract.sol')
    .modalFooterOKClick()
    .pause(2000)
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_New_contract.sol"]')
  },

  'Should remove file `1_Storage.sol` from file explorer': function (browser) {
    browser
    .moveToElement('*[data-id="treeViewLibrowser/1_Storage.sol"]', 5, 5)
    .mouseButtonClick('right')
    .click('#menuitemdelete')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/1_Storage.sol"')
  },

  'Should create a new folder': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/5_New_contract.sol"]')
    .moveToElement('*[data-id="treeViewLibrowser/5_New_contract.sol"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemcreate folder"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', 'Browser_Tests')
    .modalFooterOKClick()
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
  },

  'Should create files in folder Browser_Tests': function (browser) {
    browser
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests"]')
    .moveToElement('*[data-id="treeViewLibrowser/Browser_Tests"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemcreate file"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .setValue('*[data-id="modalDialogCustomPromptText"]', '1_Test.sol')
    .modalFooterOKClick()
    .switchFile('browser/Browser_Tests')
    .waitForElementVisible('*[data-id="treeViewLibrowser/Browser_Tests/1_Test.sol"]')
  },

  'Should delete Browser_Tests folder': function (browser) {
    browser
    .moveToElement('*[data-id="treeViewLibrowser/Browser_Tests"]', 5, 5)
    .mouseButtonClick('right')
    .click('*[id="menuitemdelete"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .modalFooterOKClick()
    .waitForElementNotPresent('*[data-id="treeViewLibrowser/Browser_Tests"]')
    .end()
  },

  tearDown: sauce
}
