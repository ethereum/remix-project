import EventEmitter from 'events'
import {NightwatchBrowser} from 'nightwatch'

class checkAnnotations extends EventEmitter {
  command(this: NightwatchBrowser, type: string): NightwatchBrowser {
    this.api.waitForElementPresent(`.glyph-margin-widgets .${type}`).perform(() => this.emit('complete'))
    return this
  }
}

module.exports = checkAnnotations
