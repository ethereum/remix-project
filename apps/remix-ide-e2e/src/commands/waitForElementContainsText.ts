import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class WaitForElementContainsText extends EventEmitter {
  command(this: NightwatchBrowser, id: string, value: string, timeout = 10000): NightwatchBrowser {
    // strip closing bracket from id
    const id_stripped = id.trim().slice(0, -1)

    this.api
      .waitForElementPresent({
        selector: `${id_stripped} and contains(.,'${value}')]`,
        timeout: timeout,
        locateStrategy: 'xpath'
      }).perform((done) => {
        done()
        this.emit('complete')
      })
    return this
    //   let waitId // eslint-disable-line
    //   let currentValue
    //   const runid = setInterval(() => {
    //     this.api.getText(id, (result) => {
    //       currentValue = result.value
    //       if (typeof result.value === 'string' && result.value.indexOf(value) !== -1) {
    //         clearInterval(runid)
    //         clearTimeout(waitId)
    //         this.api.assert.ok(true, `WaitForElementContainsText ${id} contains ${value}`)
    //         this.emit('complete')
    //       }
    //     })
    //   }, 200)

    //   waitId = setTimeout(() => {
    //     clearInterval(runid)
    //     this.api.assert.fail(`TimeoutError: An error occurred while running .waitForElementContainsText() command on ${id} after ${timeout} milliseconds. expected: ${value} - got: ${currentValue}`)
    //   }, timeout)
    //   return this
    // }
  }
}

module.exports = WaitForElementContainsText
