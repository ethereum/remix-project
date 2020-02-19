const EventEmitter = require('events')
const deepequal = require('deep-equal')

class testTransactionLog extends EventEmitter {
  command (txHash, expectedValue) {
    const browser = this.api
    const logs = {}
    const setLog = (index, value) => logs[Object.keys(logs)[index]] = value;

    browser.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
    .perform(function (client, done) {
      client.execute(function () {
        document.querySelector('#runTabView').scrollTop = document.querySelector('#runTabView').scrollHeight
      }, [], function () {
        if (expectedInput) {
          client.setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, function () {})
        }
        done()
      })
    })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(500)
    browser.waitForElementVisible(`*[data-id="txLogger${txHash}"]`)
    .click(`*[data-id="txLogger${txHash}"]`)
    .waitForElementVisible(`*[data-id="txLoggerTable${txHash}"]`)
    .click(`*[data-id="txLoggerTable${txHash}"]`)

    // fetch and format transaction logs as key => pair object
    .elements('css selector', `*[data-shared="key_${txHash}"]`, (res) => {
      res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement.ELEMENT

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          const key = jsonElement.value.trim()

          logs[key] = null
        })
      })
    })
    .elements('css selector', `*[data-shared="pair_${txHash}"]`, (res) => {
      res.value.forEach(function (jsonWebElement, index) {
        const jsonWebElementId = jsonWebElement.ELEMENT

        browser.elementIdText(jsonWebElementId, (jsonElement) => {
          let value = jsonElement.value

          try{
            value = JSON.parse(jsonElement.value)
            setLog(index, value)
          }catch(e){
            setLog(index, value)
          }
        })
      })
    })

    browser.perform(() => {
      Object.keys(expectedValue).forEach(key => {
        const equal = deepequal(logs[key], expectedValue[key])

        if (!equal) {
          browser.assert.fail(`Expected ${expectedValue[key]} but got ${logs[key]}`)
        }else{
          browser.assert.ok(true, `Expected value matched returned value ${expectedValue[key]}`)
        }
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = testTransactionLog