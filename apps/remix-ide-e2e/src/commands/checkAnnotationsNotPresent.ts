import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class checkAnnotationsNotPresent extends EventEmitter {
  command (this: NightwatchBrowser, type: string): NightwatchBrowser {
    this.api.waitForElementNotPresent(`.ace_${type}`).perform(() => this.emit('complete'))
    return this
  }
}

module.exports = checkAnnotationsNotPresent
