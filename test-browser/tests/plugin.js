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
    .end()
  },

  tearDown: sauce
}
