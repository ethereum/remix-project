import { Provider } from '@remix-project/remix-simulator'

let provider: Provider = null
self.onmessage = (e: MessageEvent) => {
  const data = e.data
  switch (data.cmd) {
    case 'init': 
    {
      provider = new Provider({ fork: data.fork, nodeUrl: data.nodeUrl, blockNumber: data.blockNumber })
      provider.init().then(() => {
        self.postMessage({
          cmd: 'initiateResult',
          stamp: data.stamp
        })
      }).catch((error) => {
        self.postMessage({
          cmd: 'initiateResult',
          error,
          stamp: data.stamp
        })
      })
      break
    }
    case 'sendAsync':
    {
      if (provider) {
        provider.sendAsync(data.query, (error, result) => {
          self.postMessage({
              cmd: 'sendAsyncResult',
              error,
              result,
              stamp: data.stamp
            })
        })
      } else {
        self.postMessage({
          cmd: 'sendAsyncResult',
          error: 'Provider not instantiated',
          result: null,
          stamp: data.stamp
        })
      }
      
      break
    }      
  }
}
