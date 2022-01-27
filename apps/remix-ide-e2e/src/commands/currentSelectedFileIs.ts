import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CurrentSelectedFileIs extends EventEmitter {
  command (this: NightwatchBrowser, value: string): NightwatchBrowser {
    this.api
      .waitForElementContainsText('*[data-id="tabs-component"] *[data-id="tab-active"]', value)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = CurrentSelectedFileIs
