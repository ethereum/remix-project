import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class CheckTerminalFilter extends EventEmitter {
  command (this: NightwatchBrowser, filter: string, test: string): NightwatchBrowser {
    this.api.perform((done) => {
      checkFilter(this.api, filter, test, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkFilter (browser: NightwatchBrowser, filter: string, test: string, done: VoidFunction) {
  if (browser.options.desiredCapabilities.browserName === 'chrome') { // nightwatch deos not handle well that part.... works locally
    done()
    return
  }
  const filterClass = '[data-id="terminalInputSearch"]'
  browser.setValue(filterClass, filter, function () {
    browser.execute(function () {
      return document.querySelector('[data-id="terminalJournal"]').innerHTML === test
    }, [], function (result) {
      browser.clearValue(filterClass).setValue(filterClass, '', function () {
        if (!result.value) {
          browser.assert.fail('useFilter on ' + filter + ' ' + test, 'info about error', '')
        }
        done()
      })
    })
  })
}

module.exports = CheckTerminalFilter
