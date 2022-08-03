'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null, true, { name: 'etherscan', url: 'http://127.0.0.1:5003'})
  },

  'Should load etherscan plugin #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtonetherscan"]')
      .clickLaunchIcon('etherscan')
      .pause(5000)
      // @ts-ignore
      .frame(0)
      .waitForElementNotVisible('input[name="apiKey"]')
  }  
}
