import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

export class scrollAndClick extends EventEmitter {
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
