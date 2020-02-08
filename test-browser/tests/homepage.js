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
    .waitForElementVisible('#icon-panel #fileExplorerIcons > div:nth-child(1)')
    .waitForElementVisible('#icon-panel #settingsIcons > div:nth-child(1)')
    .waitForElementVisible('#icon-panel #settingsIcons > div:nth-child(2)')
  },

  'Loads Side Panel': function (browser) {
    browser.waitForElementVisible('#side-panel')
    .assert.containsText('#side-panel h6[class^="swapitTitle"]', 'FILE EXPLORERS')
    .waitForElementVisible('#side-panel div[class^="treeview"]')
    .waitForElementVisible('#side-panel ul[key="browser"] > li:nth-child(4)')
  },

  'Loads Main View': function (browser) {
    browser.waitForElementVisible('#main-panel > div[class^="mainview"] > div[class^="pluginsContainer"]')
    .waitForElementVisible('#main-panel div[class^="homeContainer"] > div:nth-child(2)')
    .waitForElementVisible('#main-panel div[class^="row hpSections"] > div:nth-child(1)')
    .waitForElementVisible('#main-panel div[class^="panel"] > div[class^="terminal_container"]:nth-child(2)')
  },

  'Toggles Side Panel': function (browser) {
    browser.waitForElementVisible('#side-panel')
    .assert.visible('#side-panel')
    .assert.containsText('#side-panel h6[class^="swapitTitle"]', 'FILE EXPLORERS')
    .clickLaunchIcon('fileExplorers')
    .assert.hidden('#side-panel')
    .clickLaunchIcon('fileExplorers')
    .assert.visible('#side-panel')
    .assert.containsText('#side-panel h6[class^="swapitTitle"]', 'FILE EXPLORERS')
  },

  'Toggles Terminal': function (browser) {
    browser.waitForElementVisible('#main-panel div[class^="panel"] > div[class^="terminal_container"]')
    .assert.visible('#main-panel div[class^="panel"] > div[class^="terminal_container"]:nth-child(2)')
    .click('div[class^="bar"] > div[class^="menu"] > i')
    .checkElementStyle('div[class^="bar"] > div[class^="menu"]', 'height', '35px')
    .click('div[class^="bar"] > div[class^="menu"] > i')
    .assert.visible('#main-panel div[class^="panel"] > div[class^="terminal_container"]:nth-child(2)')
  },

  'Toggles File Explorer Browser': function (browser) {
    browser
    .waitForElementVisible('#side-panel div[class^="treeview"]')
    .assert.visible('ul[key="browser"]')
    .click('li[key="browser"] > div[key="browser"] > div.fas')
    .assert.hidden('ul[key="browser"]')
    .click('li[key="browser"] > div[key="browser"] > div.fas')
    .assert.visible('ul[key="browser"]')
  },

  'Switch Tabs using tabs icon': function (browser) {
    browser
    .waitForElementVisible('#side-panel div[class^="treeview"]')
    .switchFile('browser/3_Ballot.sol')
    .assert.containsText('div[title="browser/3_Ballot.sol"] > span', '3_Ballot.sol')
    .click('div.dropdown.px-1 > span.dropdownCaret')
    .click('#homeItem')
    .assert.containsText('div[title="home"] > span', 'Home')
    .end()
  },

  tearDown: sauce
}
