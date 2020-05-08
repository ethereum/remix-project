const EventEmitter = require('events')

class SetSolidityCompilerVersion extends EventEmitter {
  command (version) {
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
