const EventEmitter = require('events')

class ScrollUp extends EventEmitter {
  command (target, height) {
    this.api.perform((done) => {
      _scrollUp(this.api, target, height, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _scrollUp (browser, target, height, cb) {
  browser.execute(function (target, height) {
    const element = document.querySelector(target)

    element.scrollTop = element.scrollHeight - height
  }, [target, height], function () {
    cb()
  })
}

module.exports = ScrollUp
