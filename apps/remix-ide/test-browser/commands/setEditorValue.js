const EventEmitter = require('events')

class SetEditorValue extends EventEmitter {
  command (value, callback) {
    this.api.perform((client, done) => {
      this.api.execute(function (value) {
        document.getElementById('input').editor.session.setValue(value)
      }, [value], (result) => {
        done()
        if (callback) {
          callback.call(this.api)
        }
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = SetEditorValue
