'use strict'
var init = require('../init')
var sauce = require('../sauce')

module.exports = {
  beforeEach: function (browser, done) {
    try {
      init(browser, done)
    } catch (e) {
      var mes = 'error ' + e.message
      console.log(mes)
      done(mes)
    }
  },

  'Load Trace - not found': function (browser) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942zcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .assert.containsText('#txhash', '<not found>')
      .end()
  },
  tearDown: sauce
}
