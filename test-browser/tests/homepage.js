'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },
  'Loads Icon\'s Panel': function (browser) {
    browser.waitForElementVisible('#icon-panel', 10000)
    .waitForElementVisible('#icon-panel > div > div[class^="homeIcon"]')
    .waitForElementVisible('#fileExplorerIcons > div:nth-child(1)')
    .waitForElementVisible('#settingsIcons > div:nth-child(1)')
    .waitForElementVisible('#settingsIcons > div:nth-child(2)')
  },

  'Loads Side Panel': function (browser) {
    browser.waitForElementVisible('#side-panel')
    .assert.containsText('h6[class^="swapitTitle"]', 'FILE EXPLORERS')
    .waitForElementVisible('div[class^="treeview"]')
    .waitForElementVisible('ul[key="browser"] > li:nth-child(4)')
    .end()
  },

  tearDown: sauce
}
