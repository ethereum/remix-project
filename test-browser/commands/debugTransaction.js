const EventEmitter = require('events')

class debugTransaction extends EventEmitter {
  command (index = 0) {
    this.api.perform((done) => {
      checkStyle(this.api, index, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkStyle (browser, index, callback) {
  browser.pause(2000).execute(function (index) {
    const debugBtn = document.querySelectorAll('*[data-shared="txLoggerDebugButton"]')[index]

    debugBtn.click()
  }, [index], function () {
    callback()
  })
}

module.exports = debugTransaction
