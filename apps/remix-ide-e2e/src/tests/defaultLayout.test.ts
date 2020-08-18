'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Loads Icon\'s Panel': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
    .waitForElementVisible('div[data-id="verticalIconsHomeIcon"]')
    .waitForElementVisible('div[plugin="fileExplorers"]')
    .waitForElementVisible('div[plugin="pluginManager"]')
    .waitForElementVisible('div[plugin="settings"]')
  },

  'Loads Side Panel': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORERS')
    .waitForElementVisible('div[data-id="filePanelFileExplorerTree"]')
    .waitForElementVisible('li[key="browser/3_Ballot.sol"]')
  },

  'Loads Main View': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="mainPanelPluginsContainer"]')
    .waitForElementVisible('div[data-id="landingPageHomeContainer"]')
    .waitForElementVisible('div[data-id="landingPageHpSections"]')
    .waitForElementVisible('div[data-id="terminalContainer"]')
  },

  'Loads terminal': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('div[data-id="terminalCli"]', 10000)
    .journalLastChildIncludes('Welcome to Remix')
  },

  'Toggles Side Panel': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORERS')
    .clickLaunchIcon('fileExplorers')
    .assert.hidden('div[data-id="remixIdeSidePanel"]')
    .clickLaunchIcon('fileExplorers')
    .assert.visible('div[data-id="remixIdeSidePanel"]')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'FILE EXPLORERS')
  },

  'Toggles Terminal': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="terminalContainer"]')
    .assert.visible('div[data-id="terminalContainerDisplay"]')
    .click('i[data-id="terminalToggleIcon"]')
    .checkElementStyle('div[data-id="terminalToggleMenu"]', 'height', '35px')
    .click('i[data-id="terminalToggleIcon"]')
    .assert.visible('div[data-id="terminalContainerDisplay"]')
  },

  'Toggles File Explorer Browser': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('div[data-id="filePanelFileExplorerTree"]')
    .assert.visible('ul[key="browser"]')
    .click('div[data-id="treeViewTogglebrowser"]')
    .assert.hidden('ul[key="browser"]')
    .click('div[data-id="treeViewTogglebrowser"]')
    .assert.visible('ul[key="browser"]')
  },

  'Switch Tabs using tabs icon': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('div[data-id="filePanelFileExplorerTree"]')
    .openFile('browser/3_Ballot.sol')
    .assert.containsText('div[title="browser/3_Ballot.sol"]', '3_Ballot.sol')
    .click('span[class^=dropdownCaret]')
    .click('#homeItem')
    .assert.containsText('div[title="home"]', 'Home')
    .end()
  },

  tearDown: sauce
}
