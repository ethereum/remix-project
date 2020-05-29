'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },
  'CheckSolidityActivatedAndUDapp': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .clickLaunchIcon('udapp')
    .end()
  },
  tearDown: sauce
}
