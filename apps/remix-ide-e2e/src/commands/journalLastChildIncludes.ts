import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

/*
  Check if the last log in the console contains a specific text
*/
class JournalLastChildIncludes extends EventEmitter {
  command(this: NightwatchBrowser, val: string): NightwatchBrowser {
     this.api
      .waitForElementPresent({
        selector: `//*[@data-id='terminalJournal' and contains(.,'${val}')]`,
        timeout: 10000,
        locateStrategy: 'xpath'
      }).perform((done) => {
        done()
        this.emit('complete')
      })
    return this
  }
}

module.exports = JournalLastChildIncludes
