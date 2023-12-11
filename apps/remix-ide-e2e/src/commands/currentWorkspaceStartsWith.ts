import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentWorkspaceStartsWith extends EventEmitter {
  command (this: NightwatchBrowser, name: string): NightwatchBrowser {
    const browser = this.api

    browser.getText('[data-id="workspacesSelect"]', function (result) {
      browser.assert.ok((result.value as string).indexOf(name) === 0)
    })
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = CurrentWorkspaceStartsWith
