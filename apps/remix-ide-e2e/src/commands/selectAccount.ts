import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

export class SelectAccount extends EventEmitter {
  command (this: NightwatchBrowser, account?: string): NightwatchBrowser {
    if (account) {
      this.api
        .click(`select[data-id="runTabSelectAccount"] [value="${account}"]`)
        .perform(() => {
          this.emit('complete')
        })
    } else this.emit('complete')
    return this
  }
}
