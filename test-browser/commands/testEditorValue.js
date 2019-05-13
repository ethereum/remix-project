const EventEmitter = require('events')

class TestEditorValue extends EventEmitter {
  command (testvalue, callback) {
    this.api.getEditorValue((value) => {
      this.api.assert.equal(testvalue, value)
      callback()
      this.emit('complete')
    })
    return this
  }
}

module.exports = TestEditorValue
