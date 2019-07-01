const EventEmitter = require('events')

class ExecuteScript extends EventEmitter {
  command (script) {
    this.api
      .click('#terminalCli')
      .keys(script)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = ExecuteScript
