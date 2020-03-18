'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  
  before: function (browser, done) {
    init(browser, done)
  },

  'Should zoom in editor': function (browser) {
    browser.waitForElementVisible('div[data-id="mainPanelPluginsContainer"]')
    .switchFile('browser/1_Storage.sol')
    .waitForElementVisible('*[data-id="editorInput"]')
    .checkElementStyle('*[data-id="editorInput"]', 'font-size', '12px')
    .click('*[data-id="tabProxyZoomIn"]')
    .click('*[data-id="tabProxyZoomIn"]')
    .checkElementStyle('*[data-id="editorInput"]', 'font-size', '14px')
  },

  'Should zoom out editor': function (browser) {
    browser.waitForElementVisible('*[data-id="editorInput"]')
    .checkElementStyle('*[data-id="editorInput"]', 'font-size', '14px')
    .click('*[data-id="tabProxyZoomOut"]')
    .click('*[data-id="tabProxyZoomOut"]')
    .checkElementStyle('*[data-id="editorInput"]', 'font-size', '12px')
  },

  'Should display compile error in editor': function (browser) {
    browser.waitForElementVisible('*[data-id="editorInput"]')
    .waitForElementVisible('*[class="ace_content"]')
    .click('*[class="ace_content"]')
    .keys('error')
    .pause(2000)
    .waitForElementVisible('.ace_error')
  },

  'Should minimize and maximize codeblock in editor': function (browser) {
    browser.waitForElementVisible('*[data-id="editorInput"]')
    .waitForElementVisible('.ace_open')
    .click('.ace_start:nth-of-type(1)')
    .waitForElementVisible('.ace_closed')
    .click('.ace_start:nth-of-type(1)')
    .waitForElementVisible('.ace_open')
    .end()
  },

  tearDown: sauce
}
