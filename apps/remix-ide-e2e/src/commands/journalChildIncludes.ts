import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

/*
  Checks if any child elements of journal (console) contains a matching value.
*/
class JournalChildIncludes extends EventEmitter {
  command (this: NightwatchBrowser, val: string): NightwatchBrowser {
    let isTextFound = false
    const browser = this.api

    this.api.elements('css selector', '*[data-id="terminalJournal"]', (res) => {
      Array.isArray(res.value) && res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement.ELEMENT || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const text = jsonElement.value

          if (typeof text === 'string' && text.indexOf(val) !== -1) isTextFound = true
        })
      })
    })
    browser.perform(() => {
      browser.assert.ok(isTextFound, isTextFound ? `<*[data-id="terminalJournal"]> contains ${val}.` : `${val} not found in <*[data-id="terminalJournal"]> div:last-child>`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalChildIncludes
