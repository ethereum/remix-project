'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')
const testData = {
  pluginName: 'remixIde',
  pluginDisplayName: 'Remix IDE',
  pluginUrl: 'https://remix-project.org/'
}

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should Load Plugin Manager': function (browser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
    .pause(3000)
    .click('*[plugin="pluginManager"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'PLUGIN MANAGER')
  },

  'Should Search for plugins': function (browser) {
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
    .keys(browser.Keys.ENTER)
  },

  'Should activate plugins': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginManager"]')
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtondebugger"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtondebugger"]')
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonvyper"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonvyper"]')
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonZoKrates"]')
  },

  'Should deactivate plugins': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginManager"]')
    .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtondebugger"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtonvyper"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonvyper"]')
  },

  /*
  'Should grant plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerPermissionsButton"]')
    .waitForElementVisible('*[data-id="pluginManagerSettingsPermissionForm"]')
    .assert.containsText('*[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
    .click('*[data-id="verticalIconsFileExplorerIcons"]')
    .openFile('browser/3_Ballot.sol')
    .click('*[plugin="ZoKrates"]')
    .pause(5000)
    .frame(0)
    .useXpath().click("//span[text()='Compile']")
    .pause(2000)
    .frameParent()
    .useCss().waitForElementVisible('*[data-id="modalDialogContainer"]')
    .assert.containsText('*[data-id="permissionHandlerMessage"]', 'ZOKRATES" WOULD LIKE TO ACCESS "FILE MANAGER" :')
    .pause(2000)
    .click('*[data-id="permissionHandlerRememberChoice"]')
    .pause(2000)
    .modalFooterOKClick()
  },

  'Should revert plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsSettingsIcons"]')
    .click('*[data-id="verticalIconsSettingsIcons"]')
    .waitForElementVisible('*[data-id="pluginManagerPermissionsButton"]')
    .click('*[data-id="pluginManagerPermissionsButton"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .click('*[data-id="pluginManagerSettingsPermissionForm"]')
    .pause(2000)
    .click('*[data-id="pluginManagerSettingsClearAllPermission"]')
    .pause(2000)
    .assert.containsText('*[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
  },
  */

  'Should connect a local plugin': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .click('*[data-id="modalDialogModalBody"]')
    .setValue('*[data-id="localPluginName"]', testData.pluginName)
    .setValue('*[data-id="localPluginDisplayName"]', testData.pluginDisplayName)
    .setValue('*[data-id="localPluginUrl"]', testData.pluginUrl)
    .click('*[data-id="localPluginRadioButtoniframe"]')
    .click('*[data-id="localPluginRadioButtonsidePanel"]')
    .click('*[data-id="modalDialogModalFooter"]')
    .modalFooterOKClick()
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonremixIde"]')
  },

  'Should display error message for creating already existing plugin': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .click('*[data-id="modalDialogModalBody"]')
    .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', testData.pluginName)
    .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', testData.pluginDisplayName)
    .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', testData.pluginUrl)
    .click('*[data-id="localPluginRadioButtoniframe"]')
    .click('*[data-id="localPluginRadioButtonsidePanel"]')
    .click('*[data-id="modalDialogModalFooter"]')
    .modalFooterOKClick()
    .pause(5000)
    .waitForElementVisible('*[data-shared="tooltipPopup"]:nth-last-of-type(1)')
    .pause(2000)
    .assert.containsText('*[data-shared="tooltipPopup"]:nth-last-of-type(1)', 'Cannot create Plugin : This name has already been used')
  },

  'Should load back installed plugins after reload': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
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
  },
  tearDown: sauce
}
