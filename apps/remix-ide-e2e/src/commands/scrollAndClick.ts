import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class scrollAndClick extends EventEmitter {
  command (this: NightwatchBrowser, target: string): NightwatchBrowser {
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
