const EventEmitter = require('events')

class scrollAndClick extends EventEmitter {
  command (target) {
    this.api
    .scrollInto(target)
    .click(target)
    .perform(() => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = scrollAndClick
