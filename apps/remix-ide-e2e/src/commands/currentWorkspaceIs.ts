import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentWorkspaceIs extends EventEmitter {
  command (this: NightwatchBrowser, name: string): NightwatchBrowser {
    this.api
      .execute(function () {
        const el = document.querySelector('select[data-id="workspacesSelect"]') as HTMLSelectElement
        return el.value
      }, [], (result) => {
        console.log(result)
        this.api.assert.equal(result.value, name)
        this.emit('complete')
      })
    return this
  }
}

module.exports = CurrentWorkspaceIs
