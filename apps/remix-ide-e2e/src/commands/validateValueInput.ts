import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ValidateValueInput extends EventEmitter {
  command (this: NightwatchBrowser, selector: string, valueTosSet: string, expectedValue: string) {
    const browser = this.api
    browser.perform((done) => {
      browser.clearValue(selector)
        .pause(2000)
        .setValue(selector, valueTosSet)
        .execute(function (selector) {
          const elem = document.querySelector(selector) as HTMLInputElement
          return elem.value
        }, [selector], function (result) {
          browser.assert.equal(result.value, expectedValue)
        })
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ValidateValueInput
