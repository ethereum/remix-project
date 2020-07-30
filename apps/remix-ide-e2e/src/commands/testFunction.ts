import { NightwatchBrowser, NightwatchTestFunctionExpectedInput } from 'nightwatch'
import EventEmitter from "events"

const deepequal = require('deep-equal')

class TestFunction extends EventEmitter {
  command (this: NightwatchBrowser, txHash: string, expectedValue: NightwatchTestFunctionExpectedInput): NightwatchBrowser {
    const browser = this.api
    const logs = {}
    const setLog = (index: number, value: string) => { logs[Object.keys(logs)[index]] = typeof value === 'string' ? value.trim() : value }

    browser
    .waitForElementVisible(`[data-id="block_tx${txHash}"]`)
    .click(`[data-id="block_tx${txHash}"]`)
    .waitForElementVisible(`*[data-id="txLoggerTable${txHash}"]`)

    // fetch and format transaction logs as key => pair object
    .elements('css selector', `*[data-shared="key_${txHash}"]`, (res) => {
      Array.isArray(res.value) && res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId: string = jsonWebElement.ELEMENT || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const key = typeof jsonElement.value === 'string' ? jsonElement.value.trim() : null

          logs[key] = null
        })
      })
    })
    .elements('css selector', `*[data-shared="pair_${txHash}"]`, (res) => {
      Array.isArray(res.value) && res.value.forEach(function (jsonWebElement, index) {
        const jsonWebElementId = jsonWebElement.ELEMENT || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          let value = jsonElement.value

          try {
            value = JSON.parse(<string>jsonElement.value)
            setLog(index, <string>value)
          } catch (e) {
            setLog(index, <string>value)
          }
        })
      })
    })

    browser.perform(() => {
      Object.keys(expectedValue).forEach(key => {
        const equal: boolean = deepequal(logs[key], expectedValue[key])

        if (!equal) {
          browser.assert.fail(`Expected ${expectedValue[key]} but got ${logs[key]}`)
        } else {
          browser.assert.ok(true, `Expected value matched returned value ${expectedValue[key]}`)
        }
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = TestFunction
