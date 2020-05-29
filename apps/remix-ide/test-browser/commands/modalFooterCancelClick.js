const EventEmitter = require('events')

class ModalFooterOKClick extends EventEmitter {
  command () {
    this.api.waitForElementVisible('#modal-footer-cancel').perform((client, done) => {
      this.api.execute(function () {
        document.querySelector('#modal-footer-cancel').click()
      }, [], (result) => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = ModalFooterOKClick
