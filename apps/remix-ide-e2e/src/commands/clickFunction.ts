import {
  NightwatchBrowser,
  NightwatchClickFunctionExpectedInput
} from 'nightwatch'
import EventEmitter from 'events'

class ClickFunction extends EventEmitter {
  command(
    this: NightwatchBrowser,
    fnFullName: string,
    expectedInput?: NightwatchClickFunctionExpectedInput
  ): NightwatchBrowser {
    this.api
      .waitForElementPresent('.instance *[data-bs-title="' + fnFullName + '"]')
      .perform(function (client, done) {
        client.execute(
          function () {
            document.querySelector('#runTabView').scrollTop =
              document.querySelector('#runTabView').scrollHeight
          },
          [],
          function () {
            if (expectedInput) {
              client.setValue(
                '#runTabView input[data-bs-title="' + expectedInput.types + '"]',
                expectedInput.values,
                (_) => _
              )
            }
            done()
          }
        )
      })
      .scrollAndClick('.instance *[data-bs-title="' + fnFullName + '"]')
      .pause(2000)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = ClickFunction
