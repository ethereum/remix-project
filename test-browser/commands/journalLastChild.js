const EventEmitter = require('events')

class JournalLastChild extends EventEmitter {
  command (val) {
    
    this.api.assert.containsText('#journal div:last-child span.text-info', val).perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = JournalLastChild
