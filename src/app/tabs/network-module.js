const executionContext = require('../../execution-context')
import { NetworkApi } from 'remix-plugin'

export const profile = {
  name: 'network',
  description: 'Manage the network (mainnet, ropsten, goerli...) and the provider (web3, vm, injected)'
}

// Network API has :
// - events: ['providerChanged']
// - methods: ['getNetworkProvider', 'getEndpoint', 'detectNetwork', 'addNetwork', 'removeNetwork']

export class NetworkModule extends NetworkApi {
  constructor () {
    super(profile)
    // TODO: See with remix-lib to make sementic coherent
    executionContext.event.register('contextChanged', (provider) => {
      this.events.emit('providerChanged', provider)
    })
    /*
    // Events that could be implemented later
    executionContext.event.register('removeProvider', (provider) => {
      this.events.emit('networkRemoved', provider)
    })
    executionContext.event.register('addProvider', (provider) => {
      this.events.emit('networkAdded', provider)
    })
    executionContext.event.register('web3EndpointChanged', (provider) => {
      this.events.emit('web3EndpointChanged', provider)
    })
    */
  }

  /** Return the current network provider (web3, vm, injected) */
  getNetworkProvider () {
    return executionContext.getProvider()
  }

  /** Return the current network */
  detectNetwork () {
    return new Promise((resolve, reject) => {
      executionContext.detectNetwork((error, network) => {
        error ? reject(error) : resolve(network)
      })
    })
  }

  /** Return the url only if network provider is 'web3' */
  getEndpoint () {
    const provider = executionContext.getProvider()
    if (provider !== 'web3') {
      throw new Error('no endpoint: current provider is either injected or vm')
    }
    return provider.web3().currentProvider.host
  }

  /** Add a custom network to the list of available networks */
  addNetwork (customNetwork) {
    executionContext.addProvider(customNetwork)
  }

  /** Remove a network to the list of availble networks */
  removeNetwork (name) {
    executionContext.removeProvider(name)
  }
}
