'use strict'

import solc from 'solc/wrapper'
import { CompilerInput, MessageToWorker } from './types'
var compileJSON: ((input: CompilerInput) => string) | null = (input) => { return '' }
var missingInputs: string[] = []

// 'DedicatedWorkerGlobalScope' object (the Worker global scope) is accessible through the self keyword
// 'dom' and 'webworker' library files can't be included together https://github.com/microsoft/TypeScript/issues/20595
export default (self) => {
  self.addEventListener('message', (e) => {
    const data: MessageToWorker = e.data
    switch (data.cmd) {
      case 'loadVersion':
        delete self.Module
        // NOTE: workaround some browsers?
        self.Module = undefined
        compileJSON = null
        //importScripts() method of synchronously imports one or more scripts into the worker's scope
        self.importScripts(data.data)
        let compiler: solc = solc(self.Module)
        compileJSON = (input) => {
          try {
            let missingInputsCallback = (path) => {
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
        if(data.input && compileJSON) {
          self.postMessage({
            cmd: 'compiled', 
            job: data.job, 
            data: compileJSON(data.input), 
            missingInputs: missingInputs
          })
        }
        break
    }
  }, false)
}
