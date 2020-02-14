'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should Load Plugin Manager': function (browser) {
    browser.waitForElementVisible('div[data-id="remixIdeSidePanel"]')
    .pause(3000)
    .click('div[plugin="pluginManager"]')
    .waitForElementVisible('div[data-id="pluginManagerComponentPluginManager"]')
    .assert.containsText('h6[data-id="sidePanelSwapitTitle"]', 'PLUGIN MANAGER')
  },

  'Should Search for plugins': function (browser) {
    browser.waitForElementVisible('div[data-id="pluginManagerComponentPluginManager"]')
     .click('input[data-id="pluginManagerComponentSearchInput"]')
     .keys('debugger')
     .waitForElementVisible('button[data-id="pluginManagerComponentActivateButtondebugger"]')
     .clearValue('input[data-id="pluginManagerComponentSearchInput"]')
     .click('input[data-id="pluginManagerComponentSearchInput"]')
     .keys('Deploy & run transactions')
     .waitForElementVisible('button[data-id="pluginManagerComponentActivateButtonudapp"]')
     .clearValue('input[data-id="pluginManagerComponentSearchInput"]')
     .click('input[data-id="pluginManagerComponentSearchInput"]')
     .keys('ZoKrates')
     .waitForElementVisible('button[data-id="pluginManagerComponentActivateButtonZoKrates"]')
     .clearValue('input[data-id="pluginManagerComponentSearchInput"]')
     .click('input[data-id="pluginManagerComponentSearchInput"]')
     .keys(browser.Keys.ENTER)
  },

  'Should activate plugins': function (browser) {
    browser.waitForElementVisible('div[data-id="pluginManagerComponentPluginManager"]')
    .click('div[data-id="pluginManagerComponentPluginManager"]')
    .scrollAndClick('button[data-id="pluginManagerComponentActivateButtondebugger"]')
    .waitForElementVisible('button[data-id="pluginManagerComponentDeactivateButtondebugger"]')
    .scrollAndClick('button[data-id="pluginManagerComponentActivateButtonudapp"]')
    .waitForElementVisible('button[data-id="pluginManagerComponentDeactivateButtonudapp"]')
    .scrollAndClick('button[data-id="pluginManagerComponentActivateButtonZoKrates"]')
    .waitForElementVisible('button[data-id="pluginManagerComponentDeactivateButtonZoKrates"]')
  },

  'Should deactivate plugins': function (browser) {
    browser.waitForElementVisible('div[data-id="pluginManagerComponentPluginManager"]')
    .click('div[data-id="pluginManagerComponentPluginManager"]')
    .scrollAndClick('button[data-id="pluginManagerComponentDeactivateButtondebugger"]')
    .waitForElementVisible('button[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('button[data-id="pluginManagerComponentDeactivateButtonudapp"]')
    .waitForElementVisible('button[data-id="pluginManagerComponentActivateButtonudapp"]')
  },

  'Grant plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('div[data-id="pluginManagerComponentPluginManager"]')
    .click('button[data-id="pluginManagerSettingsButton"]')
    .waitForElementVisible('form[data-id="pluginManagerSettingsPermissionForm"]')
    .assert.containsText('form[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
    .click('div[data-id="verticalIconsFileExplorerIcons"]')
    .switchFile('browser/3_Ballot.sol')
    .click('div[plugin="ZoKrates"]')
    .pause(5000)
    .frame(0)
    .useXpath().click("//span[text()='Compile']")
    .frameParent()
    .useCss().waitForElementVisible('div[data-id="modalDialogContainer"]')
    .assert.containsText('h4[data-id="permissionHandlerMessage"]', 'ZOKRATES" WOULD LIKE TO ACCESS "FILE MANAGER" :')
    .pause(2000)
    .click('label[data-id="permissionHandlerRememberChoice"]')
    .pause(2000)
    .modalFooterOKClick()
  },

  'Revert plugin permission (ZOKRATES)': function (browser) {
    browser.waitForElementVisible('div[data-id="verticalIconsSettingsIcons"]')
    .click('div[data-id="verticalIconsSettingsIcons"]')
    .waitForElementVisible('button[data-id="pluginManagerSettingsButton"]')
    .click('button[data-id="pluginManagerSettingsButton"]')
    .waitForElementVisible('div[data-id="modalDialogContainer"]')
    .click('form[data-id="pluginManagerSettingsPermissionForm"]')
    .pause(2000)
    .click('i[data-id="pluginManagerSettingsClearAllPermission"]')
    .pause(2000)
    .assert.containsText('form[data-id="pluginManagerSettingsPermissionForm"]', 'No Permission requested yet')
    .modalFooterOKClick()
    .end()
  },

  tearDown: sauce
}
