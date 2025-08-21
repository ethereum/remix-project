'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, undefined, false)
  },

  'Should load Plugin Manager and search for a plugin #group1 #pr': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .assert.visible('[data-id="pluginManagerComponentPluginManager"]', 'Plugin Manager component is visible.')
      .waitForElementVisible('[data-id="pluginManagerComponentSearchInput"]')
      .setValue('[data-id="pluginManagerComponentSearchInput"]', 'debugger')
      .waitForElementVisible('[data-id="pluginManagerComponentActiveTile"]', 5000)
      .assert.containsText('[data-id="pluginManagerComponentActiveTile"]', 'Debugger')
      .clearValue('[data-id="pluginManagerComponentSearchInput"]')
  },

  'Should activate and deactivate a plugin #group1 #pr': function (browser) {
    let initialActiveCount

    browser
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .click('[data-id="pluginManagerActiveTab"]')
      .getText('[data-id="pluginManagerComponentActiveTilesCount"]', (r) => {
        initialActiveCount = parseInt(r.value)
      })
      .click('[data-id="pluginManagerInactiveTab"]')
      .waitForElementVisible('[data-id^="pluginManagerComponentActivateButton"]', 10000)
      .click('css selector', '[data-id^="pluginManagerComponentActivateButton"]')
      .pause(1200)
      .click('[data-id="pluginManagerActiveTab"]')
      .getText('[data-id="pluginManagerComponentActiveTilesCount"]', (r) => {
        const newActiveCount = parseInt(r.value)
        browser.assert.equal(newActiveCount, initialActiveCount + 1, `Active count should increase to ${initialActiveCount + 1}.`)
      })
      .waitForElementVisible('[data-id^="pluginManagerComponentDeactivateButton"]', 10000)
      .click('css selector', '[data-id^="pluginManagerComponentDeactivateButton"]')
      .pause(1200)
      .getText('[data-id="pluginManagerComponentActiveTilesCount"]', (r) => {
        const finalActiveCount = parseInt(r.value)
        browser.assert.equal(finalActiveCount, initialActiveCount, `Active count should return to ${initialActiveCount}.`)
      })
  },

  'Should filter by "Only maintained by Remix" #group2 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number
    let filteredCount: number

    browser
      .clickLaunchIcon('pluginManager')
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .click('[data-id="pluginManagerAllTab"]')
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string)
      })
      .click('[data-id="filter-by-remix-switch"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        filteredCount = parseInt(result.value as string)
        browser.assert.ok(filteredCount < initialAllCount, `Filtered count (${filteredCount}) should be less than initial count (${initialAllCount}).`)
      })
      .click('[data-id="filter-by-remix-switch"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const finalCount = parseInt(result.value as string)
        browser.assert.equal(finalCount, initialAllCount, `Count should return to initial count (${initialAllCount}).`)
      })
  },

  'Should filter by category and clear filters #group2 #pr': function (browser: NightwatchBrowser) {
    let initialAllCount: number

    browser
      .waitForElementVisible('[data-id="pluginManagerComponentPluginManager"]', 10000)
      .click('[data-id="pluginManagerAllTab"]')
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        initialAllCount = parseInt(result.value as string)
      })
      .click('[data-id="pluginManagerComponentFilterButton"]')
      .waitForElementVisible('[data-id="filter-panel"]')
      .click('[data-id="filter-checkbox-5"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const filteredCount = parseInt(result.value as string)
        browser.assert.ok(filteredCount < initialAllCount, `Category filtered count (${filteredCount}) should be less than initial count (${initialAllCount}).`)
      })
      .click('[data-id="clear-filters-btn"]')
      .pause(1000)
      .getText('[data-id="pluginManagerAllCount"]', (result) => {
        const finalCount = parseInt(result.value as string)
        browser.assert.equal(finalCount, initialAllCount, `Count should return to initial count after clearing filters.`)
      })
      .end()
  }
}