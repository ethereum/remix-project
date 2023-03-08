'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
  
    'Should create new file': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="homeTabNewFile"]')
        .click('*[data-id="homeTabNewFile"]')
        .waitForElementPresent('*[data-id$="/blank"]')
        .sendKeys('*[data-id$="/blank"] .remixui_items', 'newTestFile')
        .sendKeys('*[data-id$="/blank"] .remixui_items', browser.Keys.ENTER)
        .waitForElementVisible('li[data-id="treeViewLitreeViewItemnewTestFile.sol"]')
    }
}