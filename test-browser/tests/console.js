'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  'SimpleExecutionConsole': function (browser) {
    browser
    .waitForElementVisible('#terminalCli', 10000)
    .executeScript('1+1')
    .journalLastChild('2')
    .end()
  },
  tearDown: sauce
}
