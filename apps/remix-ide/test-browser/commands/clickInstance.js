const EventEmitter = require('events')

class ClickInstance extends EventEmitter {
  command (index) {
    index = index + 2
    let selector = '.instance:nth-of-type(' + index + ') > div > button'
    this.api.waitForElementPresent(selector).scrollAndClick(selector).perform(() => { this.emit('complete') })
    return this
  }
}

module.exports = ClickInstance
