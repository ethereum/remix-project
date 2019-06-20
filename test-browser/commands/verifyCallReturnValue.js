const EventEmitter = require('events')

class VerifyCallReturnValue extends EventEmitter {
  command (address, checks) {
    this.api.perform((done) => {
      verifyCallReturnValue(this.api, address, checks, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function verifyCallReturnValue (browser, address, checks, done) {
  browser.execute(function (address) {
    var nodes = document.querySelectorAll('#instance' + address + ' div[class^="contractActionsContainer"] div[class^="value"]')
    var ret = []
    for (var k = 0; k < nodes.length; k++) {
      var text = nodes[k].innerText ? nodes[k].innerText : nodes[k].textContent
      ret.push(text.replace('\n', ''))
    }
    return ret
  }, [address], function (result) {
    console.log('verifyCallReturnValue', result)
    for (var k in checks) {
      browser.assert.equal(result.value[k], checks[k])
    }
    done()
  })
}

module.exports = VerifyCallReturnValue
