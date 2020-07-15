const EventEmitter = require('events')

class SelectAccount extends EventEmitter {
  command (account) {
    if (account) {
      this.api
        .click(`select[data-id="runTabSelectAccount"] [value="${account}"]`)
        .perform(() => {
          this.emit('complete')
        })
    } else this.emit('complete')
    return this
  }
}

module.exports = SelectAccount
