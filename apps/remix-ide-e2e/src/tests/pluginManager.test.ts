'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testmode: boolean; }
}

const testData = {
  pluginName: 'remixIde',
  pluginDisplayName: 'Remix IDE',
  pluginUrl: 'https://zokrates.github.io/zokrates-remix-plugin/'
}

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should Load Plugin Manager': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .pause(3000)
      .click('*[plugin="pluginManager"]')
      .pause(3000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'PLUGIN MANAGER')
  },

  'Should Search for plugins': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('debugger')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('Vyper')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonvyper"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys('ZoKrates')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
      .clearValue('*[data-id="pluginManagerComponentSearchInput"]')
      .click('*[data-id="pluginManagerComponentSearchInput"]')
      .keys(browser.Keys.SPACE)
      .keys(browser.Keys.BACK_SPACE)
  },

  'Should activate plugins': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginManager"]')
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtondebugger"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]', 60000)
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonvyper"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonvyper"]', 70000)
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonZoKrates"]', 60000)
  },

  'Should deactivate plugins': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginManager"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]', 60000)
      .pause(2000)
      .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtondebugger"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]', 60000)
      .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonvyper"]', 60000)
      .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtonvyper"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonvyper"]', 60000)
  },

  'Should connect a local plugin': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .execute(function () {
        window.testmode = true
      })
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
      .waitForElementVisible('*[data-id="localPluginName"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', testData.pluginName)
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', testData.pluginDisplayName)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', testData.pluginUrl)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
  },

  'Should display error message for creating already existing plugin': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
      .waitForElementVisible('*[data-id="localPluginName"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', testData.pluginName)
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', testData.pluginDisplayName)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', testData.pluginUrl)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"]', 60000)
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"]')
      // .modalFooterOKClick()
      // .pause(2000)
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 60000)
      .pause(5000)
      .assert.containsText('*[data-shared="tooltipPopup"]', 'Cannot create Plugin : This name has already been used')
  },

  'Should load back installed plugins after reload': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .getInstalledPlugins((plugins) => {
        browser.refresh()
          .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
          .pause(3000)
          .perform((done) => {
            plugins.forEach(plugin => {
              if (plugin !== testData.pluginName) {
                browser.waitForElementVisible(`[plugin="${plugin}"`)
              }
            })
            done()
          })
      })
      .end()
  }
}
