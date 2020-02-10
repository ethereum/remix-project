const EventEmitter = require('events')

/*
  Checks if any child elements of journal (console) contains a value.
*/
class JournalChildIncludes extends EventEmitter {
  command (val) {
    let isTextFound = false
    const browser = this.api

    this.api.elements('css selector', '#journal', (res) => {
      res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement.ELEMENT

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const text = jsonElement.value

          if (text.indexOf(val) !== -1) isTextFound = true
        })
      })
    })
    browser.perform(() => {
      browser.assert.ok(isTextFound, isTextFound ? `<#journal> contains ${val}.` : `${val} not found in <#journal > div:last-child>`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalChildIncludes
