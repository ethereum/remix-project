'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },
  'Should stage README.txt': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .pause(3000)
      .click('*[plugin="pluginManager"]')
      .pause(3000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButton11111"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButton11111"]', 70000)
      .pause(3000)
      .clickLaunchIcon('11111')
      .pause(2000)
      .frame('plugin-11111')
      .waitForElementVisible('*[data-id="fileChangesREADME.txt"]')
      .click('*[data-id="addToGitChangesREADME.txt"]')
      .pause(3000)
      .waitForElementVisible('*[data-id="fileStagedREADME.txt"]') 
  },
  tearDown: sauce
}
