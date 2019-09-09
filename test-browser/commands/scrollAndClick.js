const EventEmitter = require('events')

class ScrollAndClick extends EventEmitter {
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

module.exports = ScrollAndClick
