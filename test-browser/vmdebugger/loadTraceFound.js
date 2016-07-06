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

  'Load Trace - found': function (browser) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .waitForElementVisible('#vmdebugger', 1000)
      .expect.element('#txhash').text.to.equal('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    browser.expect.element('#txfrom').text.to.equal('0x00101c5bfa3fc8bad02c9f5fd65b069306251915')
    browser.expect.element('#txto').text.to.equal('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
    browser.expect.element('#txto').text.to.equal('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
    browser.click('#unload')
      .waitForElementNotVisible('#vmdebugger', 1000)
      .end()
  },
  tearDown: sauce
}
