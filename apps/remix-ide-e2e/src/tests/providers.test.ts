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
      .switchEnvironment('ganache-provider')
      .waitForElementVisible('*[data-id="ganache-providerModalDialogModalBody-react"]')

      .execute(() => {
        (document.querySelector('*[data-id="ganache-providerModalDialogModalBody-react"] input') as any).focus()
      }, [], () => {})
      .clearValue('*[data-id="ganache-providerModalDialogModalBody-react"] input')
      .setValue('*[data-id="ganache-providerModalDialogModalBody-react"] input', 'http://127.0.0.1:8084')
      .modalFooterOKClick('ganache-provider')
      .pause(2000)
      .waitForElementNotPresent({ selector: `[data-id="selected-provider-ganache-provider"]`, timeout: 5000})
      .pause(1000)
  },

  'Should switch to ganache provider, use the default ganache URL and succeed to connect': function (browser: NightwatchBrowser) {
    browser.switchEnvironment('ganache-provider')
    .waitForElementVisible('*[data-id="ganache-providerModalDialogModalBody-react"]')
    .modalFooterOKClick('ganache-provider')
    .waitForElementContainsText('*[data-id="settingsNetworkEnv"]', 'Custom (')
    .waitForElementVisible({ selector: `[data-id="selected-provider-ganache-provider"]`, timeout: 5000})
     
  },

  'Should switch to foundry provider, set a custom URL and fail to connect': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
    .switchEnvironment('foundry-provider')
    .waitForElementVisible('*[data-id="foundry-providerModalDialogModalBody-react"]')
    .execute(() => {
      (document.querySelector('*[data-id="foundry-providerModalDialogModalBody-react"] input') as any).focus()
    }, [], () => {})
    .clearValue('*[data-id="foundry-providerModalDialogModalBody-react"] input')
    .setValue('*[data-id="foundry-providerModalDialogModalBody-react"] input', 'http://127.0.0.1:8084')
    .modalFooterOKClick('foundry-provider')
    .pause(1000)

},
  'Should switch to foundry provider, use the default foundry URL and succeed to connect': function (browser: NightwatchBrowser) {
    browser.switchEnvironment('foundry-provider')
    .waitForElementVisible('*[data-id="foundry-providerModalDialogModalBody-react"]')
    .modalFooterOKClick('foundry-provider')
    .waitForElementContainsText('*[data-id="settingsNetworkEnv"]', 'Custom (')
  }
}
