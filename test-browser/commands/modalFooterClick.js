const EventEmitter = require('events')

class ModalFooterClick extends EventEmitter {
  command (cssSelector) {
    this.api.waitForElementVisible(cssSelector).perform((client, done) => {
      this.api.execute(function () {
        document.querySelector(cssSelector).click()
      }, [], (result) => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = ModalFooterClick
