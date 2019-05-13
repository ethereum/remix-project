const EventEmitter = require('events')

class ModalFooterOKClick extends EventEmitter {
  command () {
    this.api.perform((client, done) => {
      this.api.execute(function () {
        document.querySelector('#modal-footer-ok').click()
      }, [], (result) => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = ModalFooterOKClick
