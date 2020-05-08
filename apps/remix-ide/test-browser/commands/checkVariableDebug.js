const EventEmitter = require('events')
const deepequal = require('deep-equal')

class CreateContract extends EventEmitter {
  command (id, debugValue) {
    this.api.perform((done) => {
      checkDebug(this.api, id, debugValue, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkDebug (browser, id, debugValue, done) {
    // id is soliditylocals or soliditystate
  browser.execute(function (id) {
    return document.querySelector('#' + id + ' .dropdownrawcontent').innerText
  }, [id], function (result) {
    console.log(id + ' ' + result.value)
    var value
    try {
      value = JSON.parse(result.value)
    } catch (e) {
      browser.assert.fail('cant parse solidity state', e.message, '')
      done()
      return
    }
    var equal = deepequal(debugValue, value)
    if (!equal) {
      browser.assert.fail('checkDebug on ' + id, 'info about error\n ' + JSON.stringify(debugValue) + '\n ' + JSON.stringify(value), '')
    }
    done()
  })
}

module.exports = CreateContract
