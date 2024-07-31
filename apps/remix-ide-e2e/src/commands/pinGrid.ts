import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class pinGrid extends EventEmitter {
  command (this: NightwatchBrowser, provider: string, status: boolean): NightwatchBrowser {
    this.api.useCss().waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
    .click('[data-id="settingsSelectEnvOptions"] button')
    .waitForElementVisible(`[data-id="dropdown-item-another-chain"]`)
    .click(`[data-id="dropdown-item-another-chain"]`)
    .waitForElementVisible(`[data-id="${provider}-${status ? 'unpinned' : 'pinned'}"]`)
    .click(`[data-id="${provider}-${status ? 'unpinned' : 'pinned'}"]`)
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = pinGrid
