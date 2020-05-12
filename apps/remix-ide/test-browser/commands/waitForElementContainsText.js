const EventEmitter = require('events')

class WaitForElementContainsText extends EventEmitter {
  command (id, value) {
    let incr = 0
    let runid = setInterval(() => {
      this.api.getText(id, (result) => {
        if (value.indexOf(result.value || '') !== -1) {
          clearInterval(runid)
          this.api.assert.ok(true, `WaitForElementContainsText ${id} contains ${value}`)
          this.emit('complete')
        } else incr++
        if (incr > 50) {
          clearInterval(runid)
          this.api.assert.fail(`WaitForElementContainsText - expected ${value} but got ${result.value}`)
          // throw new Error(`WaitForElementContainsText ${id} ${value}`)
        }
      })
    }, 200)
    return this
  }
}

module.exports = WaitForElementContainsText
