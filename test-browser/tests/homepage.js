'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },
  'Loads Icon\'s Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
    .waitForElementVisible('div[data-id="iconPanelHomeIcon"]')
    .waitForElementVisible('div[plugin="fileExplorers"]')
    .waitForElementVisible('div[plugin="pluginManager"]')
    .waitForElementVisible('div[plugin="settings"]')
  },

  'Loads Side Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelFileExplorerTitle"]', 'FILE EXPLORERS')
    .waitForElementVisible('div[data-id="sidePanelFileExplorerTree"]')
    .waitForElementVisible('li[key="browser/4_Ballot_test.sol"]')
  },

  'Loads Main View': function (browser) {
    browser.waitForElementVisible('div[data-id="mainPanelPluginsContainer"]')
    .waitForElementVisible('div[data-id="mainPanelHomeContainer"]')
    .waitForElementVisible('div[data-id="mainPanelHpSections"]')
    .waitForElementVisible('div[data-id="mainPanelTerminalContainer"]')
  },

  'Loads terminal': function (browser) {
    browser
    .waitForElementVisible('div[data-id="mainPanelTerminalCli"]', 10000)
    .journalLastChildIncludes('Welcome to Remix')
  },

  'Toggles Side Panel': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelFileExplorerTitle"]', 'FILE EXPLORERS')
    .clickLaunchIcon('fileExplorers')
    .assert.hidden('div[data-id="remixIdeSidePanel"]')
    .clickLaunchIcon('fileExplorers')
    .assert.visible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelFileExplorerTitle"]', 'FILE EXPLORERS')
  },

  'Toggles Terminal': function (browser) {
    browser.waitForElementVisible('div[data-id="mainPanelTerminalContainer"]')
    .assert.visible('div[data-id="mainPanelTerminalContainer"]')
    .click('i[data-id="mainPanelToggleTerminal"]')
    .checkElementStyle('div[data-id="mainPanelToggleTerminalMenu"]', 'height', '35px')
    .click('i[data-id="mainPanelToggleTerminal"]')
    .assert.visible('div[data-id="mainPanelTerminalContainer"]')
  },

  'Toggles File Explorer Browser': function (browser) {
    browser
    .waitForElementVisible('div[data-id="sidePanelFileExplorerTree"]')
    .assert.visible('ul[key="browser"]')
    .click('div[data-id="sidePanelTogglebrowser"]')
    .assert.hidden('ul[key="browser"]')
    .click('div[data-id="sidePanelTogglebrowser"]')
    .assert.visible('ul[key="browser"]')
  },

  'Switch Tabs using tabs icon': function (browser) {
    browser
    .waitForElementVisible('div[data-id="sidePanelFileExplorerTree"]')
    .switchFile('browser/3_Ballot.sol')
    .assert.containsText('div[title="browser/3_Ballot.sol"]', '3_Ballot.sol')
    .click('span[class^=dropdownCaret]')
    .click('#homeItem')
    .assert.containsText('div[title="home"]', 'Home')
    .end()
  },

  tearDown: sauce
}
