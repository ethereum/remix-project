'use strict'
var init = require('../helpers/init')

module.exports = {
  before: function (browser, done) {
    browser
    init(browser, done)
  },
  'Smoke test': function (browser) {
    browser
      .waitForElementVisible('#righthand-panel', 10000)
      .pause('10000')
      .assert.containsText('#righthand-panel', 'Solidity version')
      .end()
  }
}
