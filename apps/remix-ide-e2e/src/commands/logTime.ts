import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class LogTime extends EventEmitter {
  command (this: NightwatchBrowser, msg?: string): NightwatchBrowser {
    this.perform((done) => {
      console.log('time: ',msg, new Date().toLocaleTimeString())
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = LogTime