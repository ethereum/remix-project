const EventEmitter = require('events')

class TestEditorValue extends EventEmitter {
  command (testvalue) {
    this.api.getEditorValue((value) => {
      this.api.assert.equal(testvalue, value)
      this.emit('complete')
    })
    return this
  }
}

module.exports = TestEditorValue
