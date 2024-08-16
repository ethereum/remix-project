import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SelectAccount extends EventEmitter {
  command(this: NightwatchBrowser, account?: string): NightwatchBrowser {
    if (account) {
      this.api
        .click('#my-select-outer-container .custom-select')
        .pause(500)
        .click(`.custom-select-option[data-value="${account}"]`)
        .perform(() => {
          this.emit('complete')
        })
    } else this.emit('complete')
    return this
  }
}

module.exports = SelectAccount
