import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class JournalLastChild extends EventEmitter {
  command (this: NightwatchBrowser, val: string): NightwatchBrowser {
    this.api
      .waitForElementVisible('*[data-id="terminalJournal"] > div:last-child', 10000)
      .assert.containsText('*[data-id="terminalJournal"] > div:last-child', val).perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = JournalLastChild
