'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return []
  },

  'Should toggle AI Copilot status in the bottom bar (Simplified)': function (browser: NightwatchBrowser) {
    const statusTextSelector = '[data-id="remixui_status_bottom_bar"] span.small';
    const toggleInputSelector = '[data-id="copilot_toggle"]';

    browser
      .waitForElementVisible('[data-id="remixui_status_bottom_bar"]', 5000)
      .waitForElementContainsText(statusTextSelector, 'RemixAI Copilot', 1000)
      .perform((done) => {
        browser.getText(statusTextSelector, (result) => {
          const currentStatusText = result.value as string
          const isCurrentlyDisabled = currentStatusText.includes('(disabled)')
          const expectedStatusAfterToggle = isCurrentlyDisabled ? '(enabled)' : '(disabled)'
          browser.click(toggleInputSelector)
            .waitForElementContainsText(statusTextSelector, expectedStatusAfterToggle, 10000)
            done()
        });
      });
  }
}