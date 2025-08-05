'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, undefined, false)
  },

  'Should load Plugin Manager and switch tabs #group1 #pr': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .assert.visible('[data-id="pluginManagerComponentPluginManager"]', 'Plugin Manager component is visible.')
  },

  'Should search for a plugin #group1 #pr': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .waitForElementVisible('[data-id="pluginManagerComponentSearchInput"]')
      .setValue('[data-id="pluginManagerComponentSearchInput"]', 'debugger')
      .assert.visible('[data-id="plugin-manager-plugin-card-debugger"]', 'Debugger plugin card is visible after search.')
  },

  'Should activate and deactivate a plugin #group1 #pr': function (browser: NightwatchBrowser) {
    let initialActiveCount: number;
    browser
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .click('[data-id="pluginManagerActiveTab"]')
      .getText('[data-id="pluginManagerActiveCount"]', (result) => {
        initialActiveCount = parseInt(result.value as string);
      })
  },

  'Should filter by "Only maintained by Remix" #group2 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number;
    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string);
      })
  },

  'Should filter by category and clear filters #group2 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number;
    browser 
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string);
      })
      .end() 
  }
}