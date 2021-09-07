import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class NoWorkerErrorFor extends EventEmitter {
  command (this: NightwatchBrowser, version: string): NightwatchBrowser {
    this.api.perform((done: VoidFunction) => {
      noWorkerErrorFor(this.api, version, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function noWorkerErrorFor (browser: NightwatchBrowser, version: string, callback: VoidFunction) {
  browser
    .setSolidityCompilerVersion(version)
    .click('*[data-id="compilerContainerCompileBtn"]')
    .waitForElementPresent('*[data-id="compilationFinishedWith_' + version + '"]', 60000)
    .notContainsText('*[data-id="compiledErrors"]', `Worker error: Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://binaries.soliditylang.org/wasm/${version}' failed to load.`)
    .notContainsText('*[data-id="compiledErrors"]', 'Uncaught RangeError: Maximum call stack size exceeded')
    .notContainsText('*[data-id="compiledErrors"]', 'RangeError: Maximum call stack size exceeded')
    .perform(() => {
      callback()
    })
}

module.exports = NoWorkerErrorFor
