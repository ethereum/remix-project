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
    .executeScript(['\uE01B','\uE025','\uE01B','\uE006','\uE006','\uE006'])
    .waitForElementVisible('#journal div:last-child span.text-info', 10000)
    .journalLastChild('2')
    .end()
  },
  tearDown: sauce
}
