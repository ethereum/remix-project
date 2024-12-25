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
}

module.exports = {
  ...tests
};
