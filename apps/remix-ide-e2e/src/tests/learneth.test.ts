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

  'Should load learneth plugin #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtonLearnEth"]')
      .clickLaunchIcon('LearnEth')
  },
  'Should have Basics of Remix workshop #group1': function (browser: NightwatchBrowser) {
    browser
      // @ts-ignore
      .frame(0)
      .useXpath()
      .pause(2000)
      .waitForElementVisible({
        selector: '//*[@data-id="workshop-link-play-basics-of-remix"]',
        timeout: 120000
      })
      .click( '//*[@data-id="workshop-link-play-basics-of-remix"]')
      .pause(2000)
      .waitForElementVisible('//*[@data-id="steplist-intro-to-the-interface"]')
      .click('//*[@data-id="steplist-intro-to-the-interface"]')
      .waitForElementVisible(`//*[contains(text(), 'Remix is composed of four panels.')]`)
  }

}