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

  'Slider': function (browser) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .waitForElementVisible('#vmdebugger', 1000)
      .click('#intoforward')
      .click('#intoforward')
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
      .sendKeys('#slider', browser.Keys.LEFT_ARROW)
      .assertCurrentSelectedItem('041 PUSH 60fe47b1')
      .end()
  },
  tearDown: sauce
}
