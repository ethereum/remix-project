'use strict'
const { Provider } = require('@remix-project/remix-simulator')

let provider = null
// 'DedicatedWorkerGlobalScope' object (the Worker global scope) is accessible through the self keyword
// 'dom' and 'webworker' library files can't be included together https://github.com/microsoft/TypeScript/issues/20595
export default function (self) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  self.addEventListener('message', (e) => {
    const data = e.data
    switch (data.cmd) {
      case 'init': 
      {
        provider = new Provider({ fork: data.fork })
        provider.init()
        break
      }
      case 'sendAsync':
      {
        provider.sendAsync(data.query, (error, result) => {
            result = JSON.parse(JSON.stringify(result))
            self.postMessage({
                cmd: 'sendAsyncResult',
                error,
                result,
                stamp: data.stamp
              })
        })
        break
      }      
    }
  }, false)
}
