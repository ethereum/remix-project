'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  'New file test': function (browser) {
    browser
      .waitForElementVisible('.newFile', 10000)
      .click('.newFile')
      .pause(500)
      .assert.containsText('.active', 'Untitled')
      .end()
  },
  tearDown: sauce
}
