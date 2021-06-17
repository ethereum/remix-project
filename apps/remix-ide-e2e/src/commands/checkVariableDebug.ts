import { NightwatchBrowser, NightwatchCheckVariableDebugValue } from 'nightwatch'
import EventEmitter from 'events'

const deepequal = require('deep-equal')

class CheckVariableDebug extends EventEmitter {
  command (this: NightwatchBrowser, id: string, debugValue: NightwatchCheckVariableDebugValue): NightwatchBrowser {
    this.api.perform((done) => {
      checkDebug(this.api, id, debugValue, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkDebug (browser: NightwatchBrowser, id: string, debugValue: NightwatchCheckVariableDebugValue, done: VoidFunction) {
  // id is soliditylocals or soliditystate
  browser.execute(function (id: string) {
    const elem = document.querySelector('#' + id + ' .dropdownrawcontent') as HTMLElement

    return elem.innerText
  }, [id], function (result) {
    let value
    try {
      value = JSON.parse(<string>result.value)
    } catch (e) {
      browser.assert.fail('cant parse solidity state', e.message, '')
      done()
      return
    }
    const equal = deepequal(debugValue, value)
    if (!equal) {
      browser.assert.fail(JSON.stringify(value), 'info about error\n ' + JSON.stringify(debugValue) + '\n ' + JSON.stringify(value), '')
    }
    done()
  })
}

module.exports = CheckVariableDebug
