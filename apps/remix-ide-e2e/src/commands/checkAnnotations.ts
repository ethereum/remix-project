import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class checkAnnotations extends EventEmitter {
  command (this: NightwatchBrowser, type: string, line: number): NightwatchBrowser {
    this.api.assert.containsText(`.margin-view-overlays .${type} + div`, line.toString()).perform(() => this.emit('complete'))
    return this
  }
}

module.exports = checkAnnotations
