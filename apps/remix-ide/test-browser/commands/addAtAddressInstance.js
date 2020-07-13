const EventEmitter = require('events')

class addAtAddressInstance extends EventEmitter {
  command (address, isValidFormat, isValidChecksum) {
    this.api.perform((done) => {
      addInstance(this.api, address, isValidFormat, isValidChecksum, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addInstance (browser, address, isValidFormat, isValidChecksum, callback) {
  browser.clickLaunchIcon('udapp').clearValue('.ataddressinput').setValue('.ataddressinput', address, function () {
    browser.click('button[id^="runAndDeployAtAdressButton"]')
        .execute(function () {
          var ret = document.querySelector('div[class^="modal-body"] div').innerHTML
          document.querySelector('#modal-footer-ok').click()
          return ret
        }, [], function (result) {
          if (!isValidFormat) {
            browser.assert.equal(result.value, 'Invalid address.')
          } else if (!isValidChecksum) {
            browser.assert.equal(result.value, 'Invalid checksum address.')
          }
          callback()
        })
  })
}

module.exports = addAtAddressInstance
