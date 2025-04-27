'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

const getFrameId = function (browser: NightwatchBrowser) {
  return browser.options.desiredCapabilities.browserName === 'chrome' ? 0 : 1
}

const tests = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null)
  },

  'Should load contract verification plugin #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtoncontract-verification"]')
      .clickLaunchIcon('contract-verification')
      .pause(5000)
      .frame(getFrameId(browser))
      .waitForElementVisible('*[data-id="VerifyDescription"]')
  },

  'Should select a chain by searching #group1': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="chainDropdownbox"]')
      .sendKeys('[data-id="chainDropdownbox"]', 's')
      .sendKeys('[data-id="chainDropdownbox"]', 'c')
      .sendKeys('[data-id="chainDropdownbox"]', 'r')
      .click('[data-id="534351"]')
      .assert.attributeContains('[data-id="chainDropdownbox"]', 'value', "Scroll Sepolia Testnet (534351)")
  }
}

module.exports = {
  ...tests
};
