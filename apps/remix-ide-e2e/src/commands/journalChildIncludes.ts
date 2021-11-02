import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

/*
  Checks if any child elements of journal (console) contains a matching value.
*/
class JournalChildIncludes extends EventEmitter {
  command (this: NightwatchBrowser, val: string, opts = { shouldHaveOnlyOneOccurence: false }): NightwatchBrowser {
    let isTextFound = false
    const browser = this.api
    let occurence = 0
    this.api.elements('css selector', '*[data-id="terminalJournal"]', (res) => {
      Array.isArray(res.value) && res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement.ELEMENT || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const text = jsonElement.value

          if (typeof text === 'string' && text.indexOf(val) !== -1) {
            isTextFound = true
            occurence++
          }
        })
      })
    })
    browser.perform(() => {
      browser.assert.ok(isTextFound, isTextFound ? `<*[data-id="terminalJournal"]> contains ${val}.` : `${val} not found in <*[data-id="terminalJournal"]> div:last-child>`)
      if (opts.shouldHaveOnlyOneOccurence) browser.assert.ok(occurence === 1, `${occurence} occurence found of "${val}"`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalChildIncludes
