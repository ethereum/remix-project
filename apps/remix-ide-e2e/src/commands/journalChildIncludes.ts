import { ELEMENT_KEY, NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

/*
  Checks if any child elements of journal (console) contains a matching value.
*/
class JournalChildIncludes extends EventEmitter {
  command (this: NightwatchBrowser, val: string, opts = { shouldHaveOnlyOneOccurrence: false }): NightwatchBrowser {
    let isTextFound = false
    const browser = this.api
    let occurrence = 0
    this.api.elements('css selector', '*[data-id="terminalJournal"]', (res) => {
      Array.isArray(res.value) && res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement[ELEMENT_KEY] || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const text = jsonElement.value

          if (typeof text === 'string' && text.indexOf(val) !== -1) {
            isTextFound = true
            occurrence++
          }
        })
      })
    })
    browser.perform(() => {
      browser.assert.ok(isTextFound, isTextFound ? `<*[data-id="terminalJournal"]> contains ${val}.` : `${val} not found in <*[data-id="terminalJournal"]> div:last-child>`)
      if (opts.shouldHaveOnlyOneOccurrence) browser.assert.ok(occurrence === 1, `${occurrence} occurrence found of "${val}"`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalChildIncludes
