const EventEmitter = require('events')

class TestConstantFunction extends EventEmitter {
  command (address, fnFullName, expectedInput, expectedOutput) {
    console.log('TestConstantFunction ' + address + ' fnFullName')
    this.api.perform((done) => {
      testConstantFunction(this.api, address, fnFullName, expectedInput, expectedOutput, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function testConstantFunction (browser, address, fnFullName, expectedInput, expectedOutput, cb) {
  browser.waitForElementPresent('.instance button[title="' + fnFullName + '"]').perform(function (client, done) {
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
    .pause(1000)
    .waitForElementPresent('#instance' + address + ' div[class^="contractActionsContainer"] div[class^="value"]')
    .scrollInto('#instance' + address + ' div[class^="contractActionsContainer"] div[class^="value"]')
    .assert.containsText('#instance' + address + ' div[class^="contractActionsContainer"] div[class^="value"]', expectedOutput).perform(() => {
      cb()
    })
}

module.exports = TestConstantFunction
