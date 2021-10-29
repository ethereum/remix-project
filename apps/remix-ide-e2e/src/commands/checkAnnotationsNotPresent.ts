import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class checkAnnotationsNotPresent extends EventEmitter {
  command (this: NightwatchBrowser, type: string): NightwatchBrowser {
    this.api.waitForElementNotPresent(`.margin-view-overlays .${type}`).perform(() => this.emit('complete'))
    return this
  }
}

module.exports = checkAnnotationsNotPresent
