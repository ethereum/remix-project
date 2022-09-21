import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class switchEnvironment extends EventEmitter {
  command (this: NightwatchBrowser, provider: string): NightwatchBrowser {
    this.api.useCss().waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
    .click('[data-id="settingsSelectEnvOptions"] button')
    .waitForElementVisible(`[data-id="dropdown-item-${provider}"]`)
    .click(`[data-id="dropdown-item-${provider}"]`)
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = switchEnvironment
