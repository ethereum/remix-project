'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testmode: boolean; }
}

const testData = {
  pluginName: 'remixIde',
  pluginDisplayName: 'Remix IDE',
  pluginUrl: 'https://zokrates.github.io/zokrates-remix-plugin/'
}

const localPluginData = {
  name: testData.pluginName,
  displayName: testData.pluginDisplayName,
  canActivate: [],
  url: testData.pluginUrl,
  location: 'sidePanel'
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should Load Plugin Manager #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .pause(3000)
      .click('*[plugin="pluginManager"]')
      .pause(3000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'PLUGIN MANAGER')
  },

  'Should Search for plugins #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('debugger')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('Vyper')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonvyper"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('ZoKrates')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys(browser.Keys.SPACE)
      .keys(browser.Keys.BACK_SPACE)
  },

  'Should activate plugins #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginManager"]')
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtondebugger"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]', 60000)
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonvyper"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonvyper"]', 70000)
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonZoKrates"]', 60000)
  },

  'Should deactivate plugins #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginManager"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]', 60000)
      .pause(2000)
      .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtondebugger"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]', 60000)
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonvyper"]', 60000)
      .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtonvyper"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonvyper"]', 60000)
  },

  'Should connect a local plugin #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .pause(3000)
      .click('*[plugin="pluginManager"]')
      .clickLaunchIcon('filePanel')
      .addLocalPlugin(localPluginData, false)
      .pause(2000)
  },

  'Should display error message for creating already existing plugin #group2': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .clickLaunchIcon('filePanel')
      .addLocalPlugin(localPluginData, false)
      .waitForElementContainsText('*[data-shared="tooltipPopup"]', 'Cannot create Plugin : This name has already been used')
  },

  'Should load back installed plugins after reload #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeSidePanel"]',3000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .getInstalledPlugins((plugins) => {
        browser.refreshPage()
          .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
          .pause(3000)
          .perform((done) => {
            plugins.forEach(plugin => {
              if (plugin !== testData.pluginName) {
                browser.waitForElementVisible(`[plugin="${plugin}"`)
              }
            })
            done()
          })
      })
  }
}
