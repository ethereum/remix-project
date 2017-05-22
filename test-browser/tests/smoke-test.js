'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    browser
    init(browser, done)
  },
  'Smoke test': function (browser) {
    browser
      .waitForElementVisible('#righthand-panel', 10000)
      .click('.settingsView')
      .assert.containsText('#righthand-panel', 'Solidity version')
      .end()
  },
  tearDown: sauce
}
