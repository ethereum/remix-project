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

const localPluginData = {
  pluginName: 'localPlugin',
  pluginDisplayName: 'Local Plugin',
  pluginCanActivate: 'flattener',
  pluginUrl: 'http://localhost:2020'
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

  'Should remove unresponsive plugine with right click': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]').pause(2000)
      .waitForElementVisible('*[data-id="localPluginName"]')
      .waitForElementVisible('*[data-id="localPluginDisplayName"]')
      .waitForElementVisible('*[data-id="localPluginUrl"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', 'unresponsive')
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', 'Unresponsive plugin')
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', 'http://localhost:7879')
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
      .waitForElementVisible('*[data-id="verticalIconsKindunresponsive"]', 7000)
      .pause(5000)
      .rightClick('[data-id="verticalIconsKindunresponsive"]')
      .click('*[id="menuitemdeactivate"]')
      .waitForElementNotPresent('*[data-id="verticalIconsKindunresponsive"]')
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
      .pause(2000)
      .waitForElementVisible('*[data-id="localPluginName"]')
      .waitForElementVisible('*[data-id="localPluginDisplayName"]')
      .waitForElementVisible('*[data-id="localPluginUrl"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', testData.pluginName)
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', testData.pluginDisplayName)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', testData.pluginUrl)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
      // .modalFooterOKClick()
      // .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonremixIde"]', 60000)
  },

  'Local plugin should activate Flattener plugin': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="localPluginName"]')
      .waitForElementVisible('*[data-id="localPluginDisplayName"]')
      .waitForElementVisible('*[data-id="localPluginUrl"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', localPluginData.pluginName)
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', localPluginData.pluginDisplayName)
      .clearValue('*[data-id="localPluginCanActivate"]').setValue('*[data-id="localPluginCanActivate"]', localPluginData.pluginCanActivate)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', localPluginData.pluginUrl)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
      .waitForElementVisible('[data-id="verticalIconsKindlocalPlugin"]')
      .click('[data-id="verticalIconsKindlocalPlugin"]')
      .waitForElementNotPresent('[data-id="verticalIconsKindflattener"]')
      .pause(2000)
      // @ts-ignore
      .frame(2)
      .waitForElementVisible('[data-id="btnActivatePlugin"')
      .click('[data-id="btnActivatePlugin"')
      .pause(2000)
      .frameParent()
      .useCss().waitForElementPresent('[data-id="verticalIconsKindflattener"]')
  },

  'Local plugin should replace Flattener plugin': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('*[data-id="verticalIconsKindpluginManager"]')
      .click('*[data-id="verticalIconsKindpluginManager"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="localPluginName"]')
      .waitForElementVisible('*[data-id="localPluginDisplayName"]')
      .waitForElementVisible('*[data-id="localPluginUrl"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', 'flattener')
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', 'Flattener Replacement')
      .clearValue('*[data-id="localPluginCanActivate"]').setValue('*[data-id="localPluginCanActivate"]', localPluginData.pluginCanActivate)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', localPluginData.pluginUrl)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
      .waitForElementVisible('*[data-id="replacePluginModal-modal-footer-ok-react"]')
      .click('*[data-id="replacePluginModal-modal-footer-ok-react"]')
      .waitForElementPresent('[data-id="verticalIconsKindflattener"]')
      .waitForElementPresent('[data-id="pluginManagerComponentDeactivateButtonflattener"]')
      .waitForElementPresent('[data-id="verticalIconsKindflattener"]')
      .click('[data-id="verticalIconsKindflattener"]')
      // @ts-ignore
      .frame(2)
      .waitForElementVisible('[data-id="btnActivatePlugin"')
  },

  'Should load back installed plugins after reload': function (browser: NightwatchBrowser) {
    browser.refresh()
      .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .click('*[plugin="pluginManager"]')
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .getInstalledPlugins((plugins) => {
        browser.refresh()
          .waitForElementVisible('*[data-id="remixIdeSidePanel"]')
          .pause(3000)
          .perform((done) => {
            // const filtered = plugins.filter(plugin => plugin !== 'testremixIde') // remove this when localplugin bug is resolved
            plugins.forEach(plugin => {
              if ((plugin !== testData.pluginName) && plugin !== localPluginData.pluginName) {
                browser.waitForElementVisible(`[plugin="${plugin}"`)
              }
            })
            done()
          })
      })
  }

}
