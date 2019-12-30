'use strict'

const solc = require('solc/wrapper')

let compileJSON = function () { return '' }
const missingInputs = []

module.exports = function (self) {
  self.addEventListener('message', (e) => {
    const data = e.data
    switch (data.cmd) {
      case 'loadVersion':
        delete self.Module
        // NOTE: workaround some browsers?
        self.Module = undefined

        compileJSON = null

        self.importScripts(data.data)

        const compiler = solc(self.Module)

        compileJSON = function (input) {
          try {
            let missingInputsCallback = function (path) {
              missingInputs.push(path)
              return { 'error': 'Deferred import' }
            }
            return compiler.compile(input, { import: missingInputsCallback })
          } catch (exception) {
            return JSON.stringify({ error: 'Uncaught JavaScript exception:\n' + exception })
          }
        }

        self.postMessage({
          cmd: 'versionLoaded',
          data: compiler.version()
        })
        break
      case 'compile':
        missingInputs.length = 0
        self.postMessage({cmd: 'compiled', job: data.job, data: compileJSON(data.input), missingInputs: missingInputs})
        break
    }
  }, false)
}
