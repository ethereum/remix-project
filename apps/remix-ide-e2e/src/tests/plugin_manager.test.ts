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
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]')
      .click('[data-id="pluginManagerActiveTab"]')
      .assert.hasClass('[data-id="pluginManagerActiveTab"]', 'active', 'Active tab should be active.')
      .click('[data-id="pluginManagerInactiveTab"]')
      .assert.hasClass('[data-id="pluginManagerInactiveTab"]', 'active', 'Inactive tab should be active.')
      .click('[data-id="pluginManagerAllTab"]')
      .assert.hasClass('[data-id="pluginManagerAllTab"]', 'active', 'All plugins tab should be active.')
  },

  'Should filter by "Only maintained by Remix" #group2 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number;
    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]')
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string);
      })
      .click('[data-id="filter-by-remix-switch"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const filteredCount = parseInt(result.value as string);
        browser.assert.ok(filteredCount < initialAllCount, `Filtered count (${filteredCount}) should be less than initial count (${initialAllCount})`);
      })
      .waitForElementVisible('[data-id="plugin-manager-plugin-card-debugger"]')
      .waitForElementNotPresent('[data-id="plugin-manager-plugin-card-Starknet"]')
      .click('[data-id="filter-by-remix-switch"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const clearedCount = parseInt(result.value as string);
        browser.assert.strictEqual(clearedCount, initialAllCount, 'Plugin count should return to initial after toggling off.');
      })
  },

  'Should filter by category and clear filters #group3 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number;
    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]')
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string);
      })
      .click('[data-id="pluginManagerComponentFilterButton"]')
      .waitForElementVisible('[data-id="filter-panel"]')
      .click('[data-id="filter-label-CoreTools"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const filteredCount = parseInt(result.value as string);
        browser.assert.ok(filteredCount < initialAllCount, 'Category filter should reduce the plugin count.');
      })
      .waitForElementVisible('[data-id="plugin-manager-plugin-card-debugger"]')
      .waitForElementNotPresent('[data-id="plugin-manager-plugin-card-arbitrum-stylus"]')
      .click('[data-id="clear-filters-btn"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const clearedCount = parseInt(result.value as string);
        browser.assert.strictEqual(clearedCount, initialAllCount, 'Plugin count should return to initial after clearing filters.');
      })
      .waitForElementVisible('[data-id="plugin-manager-plugin-card-arbitrum-stylus"]')
      .end()
  }
}