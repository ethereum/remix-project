import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentWorkspaceIs extends EventEmitter {
  command (this: NightwatchBrowser, name: string): NightwatchBrowser {
    this.api
      .execute(() => {
        return (document.querySelector('select[data-id="workspacesSelect"]') as any).value
      }, [], (result) => {
        console.log(result)
        this.api.assert.equal(result.value, name)
        this.emit('complete')
      })
    return this
  }
}

module.exports = CurrentWorkspaceIs
