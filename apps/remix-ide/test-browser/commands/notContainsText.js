const EventEmitter = require('events')

class NotContainsText extends EventEmitter {
  command (cssSelector, text) {
    const browser = this.api

    browser.getText(cssSelector, (result) => {
      if (result.value.includes(text)) return this.api.assert.fail(`${cssSelector} contains ${text}.`)
      else this.api.assert.ok(`${cssSelector} does not contains ${text}.`)
    })
    .perform(() => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = NotContainsText
