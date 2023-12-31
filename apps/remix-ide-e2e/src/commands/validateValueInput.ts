import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ValidateValueInput extends EventEmitter {
  command (this: NightwatchBrowser, selector: string, valueTosSet: string, expectedValue: string) {
    const browser = this.api
    browser.perform((done) => {
      browser
        .click(selector).saveScreenshot('./reports/screenshots/validateValueInput.png')
        .clearValue(selector).saveScreenshot('./reports/screenshots/validateValueInput1.png')
        .clearValue(selector).saveScreenshot('./reports/screenshots/validateValueInput2.png')
        .setValue(selector, valueTosSet).saveScreenshot('./reports/screenshots/validateValueInput3.png')
        .pause(500)
        .execute(function (selector) {
          const elem = document.querySelector(selector) as HTMLInputElement
          return elem.value
        }, [selector], function (result) {
          browser.assert.equal(result.value, expectedValue)
        }).perform(() => { done() ;this.emit('complete') })
      
    })
    return this
  }
}

module.exports = ValidateValueInput
