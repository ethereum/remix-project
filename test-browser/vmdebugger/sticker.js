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

  'Sticker': function (browser) {
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
      .assertSticker('6', '6', '', '3', '84476', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      .click('#nextcall')
      .assertSticker('63', '63', '', '32000', '79283', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      .click('#intoforward')
      .click('#overforward')
      .assertSticker('108', '44', '', '0', '27145', '(Contract Creation - Step 63)')
      .click('#intoforward')
      .assertSticker('109', '64', '', '3', '25145', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      .end()
  },
  tearDown: sauce
}
