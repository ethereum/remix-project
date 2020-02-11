'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },
  'Loads Icon\'s Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="icon-panel"]', 10000)
    .waitForElementVisible('div[data-id="homeIcon"]')
    .waitForElementVisible('div[plugin="fileExplorers"]')
    .waitForElementVisible('div[plugin="pluginManager"]')
    .waitForElementVisible('div[plugin="settings"]')
  },

  'Loads Side Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="side-panel"]')
    .assert.containsText('h6[data-id="swapitTitle"]', 'FILE EXPLORERS')
    .waitForElementVisible('div[data-id="fileExplorerInit"]')
    .waitForElementVisible('li[key="browser/4_Ballot_test.sol"]')
  },

  'Loads Main View': function (browser) {
    browser.waitForElementVisible('div[data-id="mainPanelPluginsContainer"]')
    .waitForElementVisible('div[data-id="homeContainer"]')
    .waitForElementVisible('div[data-id="hpSections"]')
    .waitForElementVisible('div[data-id="terminalContainerDisplay"]')
  },

  'Loads terminal': function (browser) {
    browser
    .waitForElementVisible('div[data-id="terminalCli"]', 10000)
    .journalLastChildIncludes('Welcome to Remix')
  },

  'Toggles Side Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="side-panel"]')
    .assert.containsText('h6[data-id="swapitTitle"]', 'FILE EXPLORERS')
    .clickLaunchIcon('fileExplorers')
    .assert.hidden('div[data-id="side-panel"]')
    .clickLaunchIcon('fileExplorers')
    .assert.visible('div[data-id="side-panel"]')
    .assert.containsText('h6[data-id="swapitTitle"]', 'FILE EXPLORERS')
  },

  'Toggles Terminal': function (browser) {
    browser.waitForElementVisible('div[data-id="terminal_container"]')
    .assert.visible('div[data-id="terminalContainerDisplay"]')
    .click('i[data-id="toggleTerminal"]')
    .checkElementStyle('div[data-id="toggleTerminalMenu"]', 'height', '35px')
    .click('i[data-id="toggleTerminal"]')
    .assert.visible('div[data-id="terminalContainerDisplay"]')
  },

  'Toggles File Explorer Browser': function (browser) {
    browser
    .waitForElementVisible('div[data-id="fileExplorerInit"]')
    .assert.visible('ul[key="browser"]')
    .click('div[data-id="toggle_browser"]')
    .assert.hidden('ul[key="browser"]')
    .click('div[data-id="toggle_browser"]')
    .assert.visible('ul[key="browser"]')
  },

  'Switch Tabs using tabs icon': function (browser) {
    browser
    .waitForElementVisible('div[data-id="fileExplorerInit"]')
    .switchFile('browser/3_Ballot.sol')
    .assert.containsText('div[title="browser/3_Ballot.sol"]', '3_Ballot.sol')
    .click('span[class^=dropdownCaret]')
    .click('#homeItem')
    .assert.containsText('div[title="home"]', 'Home')
    .end()
  },

  tearDown: sauce
}
