const EventEmitter = require('events')

class NoWorkerErrorFor extends EventEmitter {
  command (version) {
    this.api.perform((done) => {
      noWorkerErrorFor(this.api, version, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function noWorkerErrorFor (browser, version, callback) {
  browser
    .setSolidityCompilerVersion(version)
    .pause(2000)
    .waitForElementPresent('*[data-id="compiledErrors"]')
    .notContainsText('*[data-id="compiledErrors"]', 'worker error:undefined')
    .notContainsText('*[data-id="compiledErrors"]', 'Uncaught RangeError: Maximum call stack size exceeded')
    .notContainsText('*[data-id="compiledErrors"]', 'RangeError: Maximum call stack size exceeded')
    .perform(() => {
      callback()
    })
}

module.exports = NoWorkerErrorFor
