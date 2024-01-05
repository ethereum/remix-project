'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should copy paste text with JS chrome only #flaky #group1': function (browser: NightwatchBrowser) {
    const textToCopyPaste = 'text to copy paste'
    if (browser.isChrome()) {
      browser.executeAsyncScript(function (txt, done) {
        navigator.clipboard.writeText(txt).then(function () {
          navigator.clipboard.readText().then(function (text) {
            console.log('Pasted content: ', text)
            done(text)
          }).catch(function (err) {
            console.error('Failed to read clipboard contents: ', err)
            done()
          })
        }).catch(function (err) {
          console.error('Failed to write to clipboard: ', err)
          done()
        })
      }, [textToCopyPaste], function (result) {
        console.log(result.value)
        browser.assert.ok((result as any).value === textToCopyPaste)
      })
    }
  },
  'Should copy file name': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('li[data-id="treeViewLitreeViewItemREADME.txt"]')
      .rightClick('li[data-id="treeViewLitreeViewItemREADME.txt"]')
      .waitForElementPresent('[data-id="context_menuitem_copyFileName"]')
      .click('[data-id="context_menuitem_copyFileName"]')
      .click('*[data-id="fileExplorerNewFilecreateNewFile"]')
      .pause(1000)
      .waitForElementVisible('*[data-id$="/blank"]')
      .sendKeys('*[data-id$="/blank"]', browser.Keys.CONTROL + 'v')
      .pause(1000)
      .sendKeys('*[data-id$="/blank"]', browser.Keys.ENTER)
      .pause()
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem5_New_contract.sol"]', 7000)
      .pause()
  }

}