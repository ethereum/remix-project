import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentWorkspaceIs extends EventEmitter {
  command (this: NightwatchBrowser, name: string): NightwatchBrowser {
    const browser = this.api

    browser.getText('[data-id="workspacesSelect"]', function (result) {
      browser.assert.equal(result.value, name)
    })
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = CurrentWorkspaceIs
