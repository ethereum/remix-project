'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Checks vertical icons panel context menu': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('*[data-id="verticalIconsKindpluginManager"]')
      .click('*[data-id="verticalIconsKindpluginManager"]')
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtondebugger"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]', 7000)
      .rightClickCustom('[data-id="verticalIconsKinddebugger"]')
      .waitForElementVisible('*[id="menuitemdeactivate"]')
      .waitForElementVisible('*[id="menuitemdocumentation"]')
      .click('*[data-id="remixIdeIconPanel"]')
  },

  'Checks vertical icons panel context menu deactivate': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('*[data-id="verticalIconsKinddebugger"]', 7000)
      .pause(5000)
      .rightClickCustom('[data-id="verticalIconsKinddebugger"]')
      .click('*[id="menuitemdeactivate"]')
      // .click('*[data-id="verticalIconsKindsettings"]')
      .waitForElementVisible('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="verticalIconsKindpluginManager"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]')
  }
}
