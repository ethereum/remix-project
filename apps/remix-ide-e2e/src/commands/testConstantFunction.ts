import { NightwatchBrowser, NightwatchTestConstantFunctionExpectedInput } from 'nightwatch'
import EventEmitter from 'events'

class TestConstantFunction extends EventEmitter {
  command (this: NightwatchBrowser, address: string, fnFullName: string, expectedInput: NightwatchTestConstantFunctionExpectedInput | null, expectedOutput: string): NightwatchBrowser {
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

function testConstantFunction (browser: NightwatchBrowser, address: string, fnFullName: string, expectedInput: NightwatchTestConstantFunctionExpectedInput, expectedOutput: string, cb: VoidFunction) {
  browser.waitForElementPresent('.instance button[title="' + fnFullName + '"]').perform(function (client, done) {
    client.execute(function () {
      document.querySelector('#runTabView').scrollTop = document.querySelector('#runTabView').scrollHeight
    }, [], function () {
      if (expectedInput) {
        client.waitForElementPresent('#runTabView input[title="' + expectedInput.types + '"]')
          .setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values)
      }
      done()
    })
  })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(1000)
    .waitForElementPresent('#instance' + address + ' .udapp_contractActionsContainer .udapp_value')
    .scrollInto('#instance' + address + ' .udapp_contractActionsContainer .udapp_value')
    .assert.containsText('#instance' + address + ' .udapp_contractActionsContainer .udapp_value', expectedOutput).perform(() => {
      cb()
    })
}

module.exports = TestConstantFunction
