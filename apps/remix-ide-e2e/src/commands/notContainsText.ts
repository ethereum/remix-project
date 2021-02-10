import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class NotContainsText extends EventEmitter {
  command (this: NightwatchBrowser, cssSelector: string, text: string): NightwatchBrowser {
    const browser = this.api

    browser.getText(cssSelector, (result) => {
      if (typeof result.value === 'string' && result.value.includes(text)) return this.api.assert.fail(`${cssSelector} contains ${text}.`)
      else this.api.assert.ok(true, `${cssSelector} does not contains ${text}.`)
    })
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = NotContainsText
