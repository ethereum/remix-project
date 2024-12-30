'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

const tests = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null)
  },

  'Should show fork and delete VM state icons #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .assert.elementPresent('*[data-id="selected-provider-vm-cancun"]')
      .assert.elementPresent('*[data-id="fork-state-icon"]')
      .assert.elementPresent('*[data-id="delete-state-icon"]')
  },
  'Should show toaster while trying fork and delete VM state without state #group1': function (browser: NightwatchBrowser) {
    browser
      .assert.elementPresent('*[data-id="fork-state-icon"]')
      .click('*[data-id="fork-state-icon"]')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 10000)
      .assert.containsText('*[data-shared="tooltipPopup"]', `State not available to fork, as no transactions have been made for selected environment & selected workspace.`)
  },
}

module.exports = {
  ...tests
};
