var remixLib = require('remix-lib')

var EventManager = remixLib.EventManager
var Web3Providers = remixLib.vm.Web3Providers
var DummyProvider = remixLib.vm.DummyProvider
var init = remixLib.init

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
    var self = this
    this.web3Providers.get(type, function (error, obj) {
      if (error) {
        // console.log('provider ' + type + ' not defined')
      } else {
        self.web3 = obj
        self.executionContext.detectNetwork((error, network) => {
          if (error || !network) {
            self.web3 = obj
          } else {
            var webDebugNode = init.web3DebugNode(network.name)
            self.web3 = (!webDebugNode ? obj : webDebugNode)
          }
          self.event.trigger('providerChanged', [type, self.web3])
          if (cb) return cb()
        })
        self.event.trigger('providerChanged', [type, self.web3])
      }
    })
  }

}

module.exports = ContextManager
