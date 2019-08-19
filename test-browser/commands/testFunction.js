const EventEmitter = require('events')
const deepequal = require('deep-equal')

class TestFunction extends EventEmitter {
  command (fnFullName, txHash, log, expectedInput, expectedReturn, expectedEvent, callback) {
    this.api.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
    .perform(function (client, done) {
      client.execute(function () {
        document.querySelector('#runTabView').scrollTop = document.querySelector('#runTabView').scrollHeight
      }, [], function () {
        if (expectedInput) {
          client.setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, function () {})
        }
        done()
      })
    })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(500)
    .waitForElementPresent('#main-panel div[class^="terminal"] span[id="tx' + txHash + '"]')
    .assert.containsText('#main-panel div[class^="terminal"] span[id="tx' + txHash + '"] span', log)
    .click('#main-panel div[class^="terminal"] span[id="tx' + txHash + '"] div[class^="log"]')
    .perform(function (client, done) {
      if (expectedReturn) {
        client.getText('#main-panel div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #decodedoutput', (result) => {
          console.log(result)
          var equal = deepequal(JSON.parse(result.value), JSON.parse(expectedReturn))
          if (!equal) {
            client.assert.fail('expected ' + expectedReturn + ' got ' + result.value, 'info about error', '')
          }
        })
      }
      done()
    })
    .perform((client, done) => {
      if (expectedEvent) {
        client.getText('#main-panel div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #logs', (result) => {
          console.log(result)
          var equal = deepequal(JSON.parse(result.value), JSON.parse(expectedEvent))
          if (!equal) {
            client.assert.fail('expected ' + expectedEvent + ' got ' + result.value, 'info about error', '')
          }
        })
      }
      done()
      if (callback) {
        callback.call(this.api)
      }
      this.emit('complete')
    })
    return this
  }
}

module.exports = TestFunction
