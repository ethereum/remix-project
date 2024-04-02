'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should show text in pinned contracts section #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .assert.elementPresent('*[data-id="NoPinnedInstanceText"]')
      .assert.textContains('*[data-id="NoPinnedInstanceText"]', 'No pinned contracts found for selected workspace & network')
  }
}