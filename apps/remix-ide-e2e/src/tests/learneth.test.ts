'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null)
  },
  beforeEach: function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('filePanel')
  },
 'Should load LearnEth plugin and display tutorials #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtonLearnEth"]')
      .clickLaunchIcon('LearnEth')
      .waitForElementVisible('iframe[id="plugin-LearnEth"]', 10000)
      .frame(0)
      .waitForElementVisible('[data-id="learneth-search-input"]', 10000)
      .assert.visible('[data-id="learneth-search-input"]', 'LearnEth search input is visible.')
      .assert.visible('.card', 'At least one tutorial card is visible.')
      .frameParent()
      .frameParent()
  },
  'Should filter tutorials by using search #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('LearnEth')
      .waitForElementVisible('iframe[id="plugin-LearnEth"]', 10000)
      .frame(0)
      .waitForElementVisible('[data-id="learneth-search-input"]', 10000)
      .setValue('[data-id="learneth-search-input"]', 'ERC20')
      .waitForElementVisible('.card', 5000)
      .assert.textContains('.card-title', 'ERC20', 'Tutorial list is filtered by search term "ERC20".')
      .frameParent()
      .frameParent()
  }
}