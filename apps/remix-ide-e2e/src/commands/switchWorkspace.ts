import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class switchWorkspace extends EventEmitter {
  command (this: NightwatchBrowser, workspaceName: string): NightwatchBrowser {
    this.api
    .waitForElementVisible('[data-id="workspacesSelect"]')
    .click('[data-id="workspacesSelect"]')
    .waitForElementVisible(`[data-id="dropdown-item-${workspaceName}"]`)
    .click(`[data-id="dropdown-item-${workspaceName}"]`)
    .pause(7000)
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = switchWorkspace