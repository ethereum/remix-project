import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class waitForElementNotContainsText extends EventEmitter {
  command (this: NightwatchBrowser, id: string, value: string, timeout = 10000): NightwatchBrowser {
    let waitId // eslint-disable-line
    let currentValue
    const runid = setInterval(() => {
      this.api.getText(id, (result) => {
        currentValue = result.value
        if (typeof result.value === 'string' && result.value.indexOf(value) !== -1) {
          clearInterval(runid)
          clearTimeout(waitId)
          this.api.assert.ok(false, `WaitForElementContainsText ${id} contains ${value} . It should not`)
          this.emit('complete')
        }
      })
    }, 200)

    waitId = setTimeout(() => {
      clearInterval(runid)
      this.api.assert.ok(true, `"${value}" wasn't found.`)
    }, timeout)
    return this
  }
}

module.exports = waitForElementNotContainsText
