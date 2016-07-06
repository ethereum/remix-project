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

  'Stepping': function (browser) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .waitForElementVisible('#vmdebugger', 1000)
      .click('#intoforward')
      .click('#intoforward')
      .assertCurrentSelectedItem('004 MSTORE')
      .click('#intoforward')
      .click('#intoback')
      .click('#intoback')
      .assertCurrentSelectedItem('002 PUSH 40')
      .click('#nextcall')
      .assertCurrentSelectedItem('181 CREATE')
      .click('#intoforward')
      .click('#intoforward')
      .click('#intoforward')
      .click('#intoforward')
      .click('#overforward')
      .assertCurrentSelectedItem('058 RETURN')
      .click('#intoforward')
      .click('#overback')
      .assertCurrentSelectedItem('181 CREATE')
      .end()
  },
  tearDown: sauce
}
