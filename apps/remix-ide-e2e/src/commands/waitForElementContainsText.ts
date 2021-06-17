import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class WaitForElementContainsText extends EventEmitter {
  command (this: NightwatchBrowser, id: string, value: string, timeout = 10000): NightwatchBrowser {
    let waitId // eslint-disable-line
    const runid = setInterval(() => {
      this.api.getText(id, (result) => {
        if (typeof result.value === 'string' && result.value.indexOf(value) !== -1) {
          clearInterval(runid)
          clearTimeout(waitId)
          this.api.assert.ok(true, `WaitForElementContainsText ${id} contains ${value}`)
          this.emit('complete')
        }
      })
    }, 200)

    waitId = setTimeout(() => {
      clearInterval(runid)
      this.api.assert.fail(`TimeoutError: An error occurred while running .waitForElementContainsText() command on ${id} after ${timeout} milliseconds`)
    }, timeout)
    return this
  }
}

module.exports = WaitForElementContainsText
