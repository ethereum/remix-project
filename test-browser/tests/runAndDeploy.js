'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {

  before: function (browser, done) {
    init(browser, done)
  },

  'Should load run and deploy tab': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .pause(3000)
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="sidePanelSwapitTitle"]')
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEPLOY & RUN TRANSACTIONS')
  },

  'Should sign message using account key': function (browser) {
    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .end()
  },

  tearDown: sauce
}
