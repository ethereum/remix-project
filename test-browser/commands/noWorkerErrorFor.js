const EventEmitter = require('events')

class NoWorkerErrorFor extends EventEmitter {
  command (version, content) {
    this.api.perform((done) => {
      noWorkerErrorFor(this.api, version, content, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function noWorkerErrorFor (browser, version, done) {
  browser
    .clickLaunchIcon('solidity')
    .setSolidityCompilerVersion(version)
    .waitForElementPresent('*[data-id="compiledErrors"]')
    .notContainsText('*[data-id="compiledErrors"]', 'worker error:undefined')
    .notContainsText('*[data-id="compiledErrors"]', 'Uncaught RangeError: Maximum call stack size exceeded')
    .notContainsText('*[data-id="compiledErrors"]', 'RangeError: Maximum call stack size exceeded')
    .perform(function (done) {
      done()
    })
}

module.exports = NoWorkerErrorFor
