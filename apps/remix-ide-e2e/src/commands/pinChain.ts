import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class pinChain extends EventEmitter {
  command (this: NightwatchBrowser, provider: string): NightwatchBrowser {
    this.api.useCss().waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
    .click('[data-id="settingsSelectEnvOptions"] button')
    .waitForElementVisible(`[data-id="dropdown-item-another-chain"]`)
    .click(`[data-id="dropdown-item-another-chain"]`)
    .waitForElementVisible(`[data-id="${provider}-unpinned"]`)
    .click(`[data-id="${provider}-unpinned"]`)
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = pinChain
