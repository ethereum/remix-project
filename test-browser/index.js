/* global web3Override */
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
      .assert.containsText('#txhash', '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51')
      .assert.containsText('#txfrom', '0x00101c5bfa3fc8bad02c9f5fd65b069306251915')
      .assert.containsText('#txto', '0x0d3a18d64dfe4f927832ab58d6451cecc4e517c5')
      .click('#unload')
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
      .checkCurrentSelectedItem('004 MSTORE')
      .click('#intoforward')
      .click('#intoback')
      .click('#intoback')
      .checkCurrentSelectedItem('002 PUSH 40')
      .click('#nextcall')
      .checkCurrentSelectedItem('181 CREATE')
      .click('#intoforward')
      .click('#intoforward')
      .click('#intoforward')
      .click('#intoforward')
      .click('#overforward')
      .checkCurrentSelectedItem('058 RETURN')
      .click('#intoforward')
      .click('#overback')
      .checkCurrentSelectedItem('181 CREATE')
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
      .checkCurrentSelectedItem('041 PUSH 60fe47b1')
      .end()
  }
}

function init (browser, callback) {
  browser.checkCurrentSelectedItem = function (expected) {
    browser.getValue('#asmitems', function (result) {
      browser.assert.containsText('#asmitems option[value="' + result.value + '"]', expected)
    })
    return browser
  }

  browser
    .url('http://127.0.0.1:8080')
  injectScript('./test/resources/testWeb3.js', browser, function () {
    callback()
  })
}

function readFile (filename, callback) {
  var fs = require('fs')
  try {
    console.log('reading ' + filename)
    fs.readFile(filename, 'utf8', callback)
  } catch (e) {
    console.log(e)
    callback(e)
  }
}

function injectScript (file, browser, callback) {
  readFile(file, function (error, result) {
    if (!error) {
      browser.execute(function (data) {
        eval.call(null, data) // eslint-disable-line
        var vmdebugger = document.getElementById('app').vmdebugger
        vmdebugger.web3.eth.getCode = web3Override.getCode
        vmdebugger.web3.debug.traceTransaction = web3Override.traceTransaction
        vmdebugger.web3.debug.storageAt = web3Override.storageAt
        vmdebugger.web3.eth.getTransaction = web3Override.getTransaction
        vmdebugger.web3.eth.getTransactionFromBlock = web3Override.getTransactionFromBlock
        vmdebugger.web3.eth.getBlockNumber = web3Override.getBlockNumber
      }, [result], function () {
        callback()
      })
    }
  })
}
