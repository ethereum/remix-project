const EventEmitter = require('events')

class GetModalBody extends EventEmitter {
  command (callback) {
    this.api.waitForElementVisible('.modal-body')
    .getText('.modal-body', (result) => {
      console.log(result)
      callback(result.value, () => {
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = GetModalBody
