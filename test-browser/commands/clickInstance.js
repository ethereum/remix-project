const EventEmitter = require('events')

class ClickInstance extends EventEmitter {
  command (index) {
    index = index + 2
    this.api.click('.instance:nth-of-type(' + index + ') > div > button').perform(() => { this.emit('complete') })
    return this
  }
}

module.exports = ClickInstance
