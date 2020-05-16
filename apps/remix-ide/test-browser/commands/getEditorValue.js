const EventEmitter = require('events')

class GetEditorValue extends EventEmitter {
  command (callback) {
    this.api.perform((client, done) => {
      this.api.execute(function (value) {
        return document.getElementById('input').editor.getValue()
      }, [], (result) => {
        done(result.value)
        callback(result.value)
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = GetEditorValue
