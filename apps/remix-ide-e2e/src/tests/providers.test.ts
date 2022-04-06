'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should switch to ganache provider, set a custom URL and fail to connect': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('udapp')
      .click('*[data-id="Ganache Provider"]')
      .waitForElementVisible('*[data-id="ganache-providerModalDialogModalBody-react"]')
      .execute(() => {
        (document.querySelector('*[data-id="ganache-providerModalDialogModalBody-react"] input') as any).focus()
      }, [], () => {})
      .clearValue('*[data-id="ganache-providerModalDialogModalBody-react"] input')
      .setValue('*[data-id="ganache-providerModalDialogModalBody-react"] input', 'http://127.0.0.1:8084')
      .modalFooterOKClick('ganache-provider')
      .waitForElementContainsText('*[data-id="ganache-providerModalDialogModalBody-react"]', 'Error while connecting to the provider')
      .modalFooterOKClick('ganache-provider')
      .waitForElementNotVisible('*[data-id="ganache-providerModalDialogModalBody-react"]')
      .pause(1000)
  },

  'Should switch to ganache provider, use the default ganache URL and succeed to connect': function (browser: NightwatchBrowser) {
    browser.click('*[data-id="Ganache Provider"]')
    .waitForElementVisible('*[data-id="ganache-providerModalDialogModalBody-react"]')
    .modalFooterOKClick('ganache-provider')
    .waitForElementContainsText('*[data-id="settingsNetworkEnv"]', 'Custom (')
  }
}
