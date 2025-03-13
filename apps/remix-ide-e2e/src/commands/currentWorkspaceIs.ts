import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentWorkspaceIs extends EventEmitter {
  command (this: NightwatchBrowser, name: string): NightwatchBrowser {
    const browser = this.api
    const xpath = `//*[@data-id="workspacesSelect"]//*[@data-id="dropdown-content"][contains(normalize-space(), "${name}")]`;

    browser.waitForElementVisible({
      locateStrategy: 'xpath',
      selector: xpath,
      timeout: 20000
    })
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = CurrentWorkspaceIs
