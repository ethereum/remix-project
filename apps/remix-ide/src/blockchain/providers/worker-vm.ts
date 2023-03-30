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
    case 'addAccount':
    {
      if (provider) {
        provider.Accounts._addAccount(data.privateKey, data.balance)
      }
      
      break
    }
    case 'newAccount':
    {
      if (provider) {
        provider.Accounts.newAccount((error, address: string) => {
          if (error) {
            self.postMessage({
              cmd: 'newAccountResult',
              error,
              stamp: data.stamp
            })
          } else {
            self.postMessage({
              cmd: 'newAccountResult',
              result: address,
              stamp: data.stamp
            })
          }          
        })
      }
      
      break
    }  
  }
}
