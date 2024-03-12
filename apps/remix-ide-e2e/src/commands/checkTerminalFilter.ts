import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class CheckTerminalFilter extends EventEmitter {
  command (this: NightwatchBrowser, filter: string, test: string, notContain: boolean): NightwatchBrowser {
    this.api.perform((done) => {
      checkFilter(this.api, filter, test, notContain, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkFilter (browser: NightwatchBrowser, filter: string, inputTest: string, notContain: boolean, done: VoidFunction) {
  /*if (browser.options.desiredCapabilities.browserName === 'chrome') { // nightwatch deos not handle well that part.... works locally
    done()
    return
  }*/
  const filterClass = '[data-id="terminalInputSearchTerminal"]'
  browser.clearValue(filterClass).setValue(filterClass, filter, function () {
    browser.execute(function () {
      return document.querySelector('[data-id="terminalJournal"]').innerHTML   
    }, [], function (result) {
      console.log(notContain, result.value, filter)
      if (!notContain) {
        // the input text should be contained in the result
        if ((result.value as string).indexOf(filter) === -1) {
          browser.assert.fail('useFilter on ' + filter + ' ' + test, 'the input text should be contained in the result', '')
        }
      }
      if (notContain) {
        // the input text should not be contained in the result
        if ((result.value as string).indexOf(filter) !== -1) {
          browser.assert.fail('useFilter on ' + filter + ' ' + test, 'the input text should not be contained in the result', '')
        }
      }     
      browser.clearValue(filterClass).perform(() => {
        done()
      })
    })
  })
}

module.exports = CheckTerminalFilter
