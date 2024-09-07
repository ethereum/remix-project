import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class pinGrid extends EventEmitter {
  command (this: NightwatchBrowser, provider: string, status: boolean): NightwatchBrowser {
    this.api.useCss()
    .perform((done) => {
      // check if the providers plugin is loaded.
      this.api.isVisible({ selector: '[data-id="remixUIGSDeploy using a Browser Extension."]', suppressNotFoundErrors: true}, (result) => {
        if (!result.value) {
          this.api.waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
            .click('[data-id="settingsSelectEnvOptions"] button')
            .waitForElementVisible(`[data-id="dropdown-item-another-chain"]`)
            .click(`[data-id="dropdown-item-another-chain"]`)
            .perform(() => done())
        } else done()
      })
    })    
    .waitForElementVisible(`[data-id="${provider}-${status ? 'unpinned' : 'pinned'}"]`, 60000)
    .click(`[data-id="${provider}-${status ? 'unpinned' : 'pinned'}"]`)
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = pinGrid
