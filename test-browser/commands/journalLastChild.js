const EventEmitter = require('events')

class JournalLastChild extends EventEmitter {
  command (val) {
    this.api
    .waitForElementVisible('#journal > div:last-child', 10000)
    .assert.containsText('#journal > div:last-child', val).perform(() => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalLastChild
