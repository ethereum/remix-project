const EventEmitter = require('events')

class JournalLastChild extends EventEmitter {
  command (val) {
    this.api
    .waitForElementVisible('div[data-id="terminalJournal"] > div:last-child', 10000)
    .assert.containsText('div[data-id="terminalJournal"] > div:last-child', val).perform(() => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalLastChild
