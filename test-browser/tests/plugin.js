'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

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
     .keys('Deploy & run transactions')
     .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonudapp"]')
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
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonudapp"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonudapp"]')
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonZoKrates"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentDeactivateButtonZoKrates"]')
  },

  'Should deactivate plugins': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginManager"]')
    .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtondebugger"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('*[data-id="pluginManagerComponentDeactivateButtonudapp"]')
    .waitForElementVisible('*[data-id="pluginManagerComponentActivateButtonudapp"]')
  },

  'Grant plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .click('*[data-id="pluginManagerSettingsButton"]')
    .waitForElementVisible('*[data-id="pluginManagerSettingsPermissionForm"]')
    .assert.containsText('*[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
    .click('*[data-id="verticalIconsFileExplorerIcons"]')
    .switchFile('browser/3_Ballot.sol')
    .click('*[plugin="ZoKrates"]')
    .pause(5000)
    .frame(0)
    .useXpath().click("//span[text()='Compile']")
    .frameParent()
    .useCss().waitForElementVisible('*[data-id="modalDialogContainer"]')
    .assert.containsText('*[data-id="permissionHandlerMessage"]', 'ZOKRATES" WOULD LIKE TO ACCESS "FILE MANAGER" :')
    .pause(2000)
    .click('*[data-id="permissionHandlerRememberChoice"]')
    .pause(2000)
    .modalFooterOKClick()
  },

  'Revert plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsSettingsIcons"]')
    .click('*[data-id="verticalIconsSettingsIcons"]')
    .waitForElementVisible('*[data-id="pluginManagerSettingsButton"]')
    .click('*[data-id="pluginManagerSettingsButton"]')
    .waitForElementVisible('*[data-id="modalDialogContainer"]')
    .click('*[data-id="pluginManagerSettingsPermissionForm"]')
    .pause(2000)
    .click('*[data-id="pluginManagerSettingsClearAllPermission"]')
    .pause(2000)
    .assert.containsText('*[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
    .end()
  },

  tearDown: sauce
}
