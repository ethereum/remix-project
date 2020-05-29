const EventEmitter = require('events')

class ScrollInto extends EventEmitter {
  command (target) {
    this.api.perform((client, done) => {
      _scrollInto(this.api, target, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _scrollInto (browser, target, cb) {
  browser.execute(function (target) {
    document.querySelector(target).scrollIntoView(({block: 'center'}))
  }, [target], function () {
    cb()
  })
}

module.exports = ScrollInto
