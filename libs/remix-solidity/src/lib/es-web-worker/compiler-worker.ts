import setupMethods from 'solc/wrapper'
import { CompilerInput, MessageToWorker } from './../../compiler/types'
let compileJSON: ((input: CompilerInput) => string) | null = (input) => { return '' }
const missingInputs: string[] = []

self.onmessage = (e: MessageEvent) => {
  const data: MessageToWorker = e.data
  switch (data.cmd) {
    case 'loadVersion':
      {
        (self as any).importScripts(data.data)
        const compiler = setupMethods(self)
        compileJSON = (input) => {
          try {
            const missingInputsCallback = (path) => {
              missingInputs.push(path)
              return { error: 'Deferred import' }
            }
            return compiler.compile(input, { import: missingInputsCallback })
          } catch (exception) {
            return JSON.stringify({ error: 'Uncaught JavaScript exception:\n' + exception })
          }
        }
        self.postMessage({
          cmd: 'versionLoaded',
          data: compiler.version(),
          license: compiler.license()
        })
        break
      }

    case 'compile':
      missingInputs.length = 0
      if (data.input && compileJSON) {
        self.postMessage({
          cmd: 'compiled',
          job: data.job,
          timestamp: data.timestamp,
          data: compileJSON(data.input),
          input: data.input,
          missingInputs: missingInputs
        })
      }
      break
  }
}

