import { NightwatchBrowser, NightwatchClickFunctionExpectedInput } from 'nightwatch'
import EventEmitter from 'events'

class ClickFunction extends EventEmitter {
  command (this: NightwatchBrowser, fnFullName: string, expectedInput?: NightwatchClickFunctionExpectedInput): NightwatchBrowser {
    this.api.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
      .scrollInto('#runTabView input[title="' + expectedInput.types + '"]')
      .setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, _ => _)
      .scrollAndClick('.instance button[title="' + fnFullName + '"]')
      .pause(2000)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = ClickFunction
