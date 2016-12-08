'use strict'
var init = require('./init')
var sauce = require('./sauce')

module.exports = {
  beforeEach: function (browser, done) {
    try {
      init(browser, function () {
        done()
      })
    } catch (e) {
      var mes = 'error ' + e.message
      console.log(mes)
      done(mes)
    }
  },

  'vmdebugger': function (browser) {
    loadTraceNotFound(browser)
    .click('#unload')
    loadTrace(browser)
    .click('#unload')
    panels(browser)
    .click('#unload')
    slider(browser)
    .click('#unload')
    stepping(browser)
    .click('#unload')
    stepdetail(browser)
    .end()
  },

  tearDown: sauce
}

function loadTraceNotFound (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942zcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#txinfo .title')
    .click('#txinfo .dropdownpanel .btn')
    .expect.element('#txinfo .dropdownpanel .dropdownrawcontent').text.to.contain('<not found>')
  return browser
}

function loadTrace (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#txinfo .title')
    .click('#txinfo .dropdownpanel .btn')
    .expect.element('#txinfo .dropdownpanel .dropdownrawcontent').text.to.contain('0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
  browser.click('#unload')
    .waitForElementNotVisible('#vmdebugger', 1000)
  return browser
}

function panels (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#nextcall')
    .assertStack(['0x', '0x60', '0x65', '0x38', '0x55', '0x60fe47b1'])
    .pause(5000)
    .assertStorageChanges(['0x000x38'])
    .assertCallData(['0x60fe47b10000000000000000000000000000000000000000000000000000000000000038'])
    .assertCallStack(['0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5'])
    .assertStackValue(1, '0x60')
    .assertMemoryValue(6, '0x6060606040526040516020806045833981????R??Q????E?9?')
    .assertMemoryValue(7, '0x7001604052808051906020019091905050???R??Q???????PP')
    .assertMemoryValue(8, '0x805b806001016000600050819055505b50?????????P??UP?P')
    .click('#intoforward') // CREATE
    .assertStack(['Empty'])
    .assertStorageChanges(['Empty'])
    .assertMemory(['Empty'])
    .assertCallData(['0x0000000000000000000000000000000000000000000000000000000000000000000000000000006060606040526040516020806045833981016040528080519060200190919050505b806001016000600050819055'])
    .assertCallStack(['0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5', '(ContractCreation-Step63)'])
  return browser
}

function slider (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    /*
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.RIGHT_ARROW)
    .sendKeys('#slider', browser.Keys.LEFT_ARROW)
    */
    .assertCurrentSelectedItem('041 PUSH4 60fe47b1')
  return browser
}

function stepping (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#intoforward')
    .click('#intoforward')
    .assertCurrentSelectedItem('004 MSTORE')
    .click('#intoforward')
    .click('#intoback')
    .click('#intoback')
    .assertCurrentSelectedItem('002 PUSH1 40')
    .click('#nextcall')
    .assertCurrentSelectedItem('181 CREATE')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#overforward')
    .assertCurrentSelectedItem('007 MLOAD')
    .click('#overback')
    .click('#overback')
    .click('#overback')
    .click('#overback')
    .click('#overback')
    .click('#overforward')
    .assertCurrentSelectedItem('182 PUSH1 01')
    .click('#overforward')
    .assertCurrentSelectedItem('184 PUSH1 00')
  return browser
}

function stepdetail (browser) {
  browser
    .clearValue('#txinput')
    .setValue('#txinput', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
    .click('#load')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    .click('#intoforward')
    /*
    .fireEvent('#slider', browser.debugerKeyCode.Right, 4, function () {
      browser.assertSticker('6', '6', '', '3', '84476', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
        .click('#nextcall')
        .assertSticker('63', '63', '', '32000', '79283', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
        .click('#intoforward')
        .click('#overforward')
        .assertSticker('108', '44', '', '0', '27145', '(Contract Creation - Step 63)')
        .click('#intoforward')
        .assertSticker('109', '64', '', '3', '25145', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
        .end()
    })
    */
    .assertStepDetail('6', '6', '', '3', '84476', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
    .click('#nextcall')
    .assertStepDetail('63', '63', '', '32000', '79283', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
    .click('#overforward')
    .click('#intoback')
    .assertStepDetail('108', '44', '', '0', '27145', '(ContractCreation-Step63)')
    .click('#intoforward')
    .assertStepDetail('109', '64', '', '3', '25145', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
  return browser
}
