'use strict'
var init = require('./init')
module.exports = {
  beforeEach: function (browser, done) {
    init(browser, done)
  },

  'Load Trace - not found': function (browser) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942zcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .assert.containsText('#txhash', '<not found>')
      .end()
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

  'Panels': function (browser, done) {
    browser
      .clearValue('#txinput')
      .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .click('#load')
      .waitForElementVisible('#vmdebugger', 1000)
      .click('#nextcall')
      .assertStack('0x\n0x60\n0x65\n0x38\n0x55\n0x60fe47b1')
      .assertStackValue(1, '0x60')
      .assertStorageChanges('0x00  0x38')
      .assertMemoryValue(6, '0xc0    60 60 60 40 52 60 40 51 60 20 80 60 45 83 39 81 ????R??Q????E?9?')
      .assertMemoryValue(7, '0xe0    01 60 40 52 80 80 51 90 60 20 01 90 91 90 50 50 ???R??Q???????PP')
      .assertMemoryValue(8, '0x100    5b 80 60 01 01 60 00 60 00 50 81 90 55 50 5b 50 ?????????P??UP?P')
      .assertCallData('0x60fe47b10000000000000000000000000000000000000000000000000000000000000038')
      .assertCallStack('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      .click('#intoforward') // CREATE
      .assertStack('')
      .assertStorageChanges('')
      .assertMemory('')
      .assertCallData('0x0000000000000000000000000000000000000000000000000000000000000000000000000000006060606040526040516020806045833981016040528080519060200190919050505b806001016000600050819055')
      .assertCallStack('0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5\n(Contract Creation - Step 63)')
      .end()
  }
}
