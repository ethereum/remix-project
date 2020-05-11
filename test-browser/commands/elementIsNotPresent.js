const EventEmitter = require('events')

class ElementIsPresent extends EventEmitter {
  command (cssSelector) {
    this.api.execute((cssSelector) => {
      return !!document.querySelector(cssSelector)
    }, [cssSelector], (result) => {
      this.api.assert.equal(false, result.value, `${cssSelector} should not be present`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = ElementIsPresent
