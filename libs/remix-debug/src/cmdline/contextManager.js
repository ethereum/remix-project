const remixLib = require('remix-lib')

const EventManager = remixLib.EventManager
const Web3Providers = remixLib.vm.Web3Providers
const DummyProvider = remixLib.vm.DummyProvider
const init = remixLib.init

class ContextManager {
  constructor (executionContext) {
    this.executionContext = executionContext
    this.web3 = this.executionContext.web3()
    this.event = new EventManager()
  }

  initProviders () {
    this.web3Providers = new Web3Providers()
    this.addProvider('DUMMYWEB3', new DummyProvider())
    this.switchProvider('DUMMYWEB3')

    this.addProvider('vm', this.executionContext.vm())
    this.addProvider('injected', this.executionContext.internalWeb3())
    this.addProvider('web3', this.executionContext.internalWeb3())
    this.switchProvider(this.executionContext.getProvider())
  }

  getWeb3 () {
    return this.web3
  }

  addProvider (type, obj) {
    this.web3Providers.addProvider(type, obj)
    this.event.trigger('providerAdded', [type])
  }

  switchProvider (type, cb) {
    this.web3Providers.get(type, (error, obj) => {
      if (error) {
        // console.log('provider ' + type + ' not defined')
      } else {
        this.web3 = obj
        this.executionContext.detectNetwork((error, network) => {
          if (error || !network) {
            this.web3 = obj
          } else {
            var webDebugNode = init.web3DebugNode(network.name)
            this.web3 = (!webDebugNode ? obj : webDebugNode)
          }
          this.event.trigger('providerChanged', [type, this.web3])
          if (cb) return cb()
        })
        this.event.trigger('providerChanged', [type, this.web3])
      }
    })
  }

}

module.exports = ContextManager
