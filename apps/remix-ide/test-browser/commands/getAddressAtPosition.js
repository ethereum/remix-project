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
  browser.waitForElementPresent('*[data-shared="universalDappUiInstance"]')
  .execute(function (index) {
    const deployedContracts = document.querySelectorAll('*[data-shared="universalDappUiInstance"]')
    const id = deployedContracts[index].getAttribute('id')

    return id.replace('instance', '')
  }, [index], function (result) {
    callback(result.value)
  })
}

module.exports = GetAddressAtPosition
