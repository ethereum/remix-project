const EventEmitter = require('events')

class GetAddressAtPosition extends EventEmitter {
  command (index, cb) {
    this.api.perform((done) => {
      getAddressAtPosition(this.api, index, (pos) => {
        done()
        cb(pos)
        this.emit('complete')
      })
    })
    return this
  }
}

function getAddressAtPosition (browser, index, callback) {
  index = index + 2
  browser.execute(function (index) {
    return document.querySelector('.instance:nth-of-type(' + index + ')').getAttribute('id').replace('instance', '')
  }, [index], function (result) {
    callback(result.value)
  })
}

module.exports = GetAddressAtPosition
