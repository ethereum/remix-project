import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SetSolidityCompilerVersion extends EventEmitter {
  command (this: NightwatchBrowser, version: string): NightwatchBrowser {
    this.api
      .click(`#compileTabView #versionSelector [value="${version}"]`)
      .pause(5000)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = SetSolidityCompilerVersion
