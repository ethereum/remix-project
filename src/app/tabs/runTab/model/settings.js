var ethJSUtil = require('ethereumjs-util')
var Personal = require('web3-eth-personal')
var remixLib = require('remix-lib')
var Web3 = require('web3')
const addTooltip = require('../../../ui/tooltip')
var EventManager = remixLib.EventManager

class Settings {

  constructor (executionContext, udapp) {
    this.executionContext = executionContext
    this.udapp = udapp
    this.event = new EventManager()

    this.udapp.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      this.event.trigger('transactionExecuted', [error, from, to, data, lookupOnly, txResult])
    })

    this.executionContext.event.register('contextChanged', (context, silent) => {
      this.event.trigger('contextChanged', [context, silent])
    })

    this.executionContext.event.register('addProvider', (network) => {
      this.event.trigger('addProvider', [network])
    })

    this.executionContext.event.register('removeProvider', (name) => {
      this.event.trigger('removeProvider', [name])
    })

    this.networkcallid = 0
  }

  changeExecutionContext (context, confirmCb, infoCb, cb) {
    return this.executionContext.executionContextChange(context, null, confirmCb, infoCb, cb)
  }

  setProviderFromEndpoint (target, context, cb) {
    return this.executionContext.setProviderFromEndpoint(target, context, cb)
  }

  getProvider () {
    return this.executionContext.getProvider()
  }

  getAccountBalanceForAddress (address, cb) {
    return this.udapp.getBalanceInEther(address, cb)
  }

  updateNetwork (cb) {
    this.networkcallid++
    ((callid) => {
      this.executionContext.detectNetwork((err, { id, name } = {}) => {
        if (this.networkcallid > callid) return
        this.networkcallid++
        if (err) {
          return cb(err)
        }
        cb(null, {id, name})
      })
    })(this.networkcallid)
  }

  newAccount (passphraseCb, cb) {
    return this.udapp.newAccount('', passphraseCb, cb)
  }

  getAccounts (cb) {
    return this.udapp.getAccounts(cb)
  }

  isWeb3Provider () {
    var isVM = this.executionContext.isVM()
    var isInjected = this.executionContext.getProvider() === 'injected'
    return (!isVM && !isInjected)
  }

  isInjectedWeb3 () {
    return this.executionContext.getProvider() === 'injected'
  }

  signMessage (message, account, passphrase, cb) {
    var isVM = this.executionContext.isVM()
    var isInjected = this.executionContext.getProvider() === 'injected'

    if (isVM) {
      const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
      var privKey = this.udapp.accounts[account].privateKey
      try {
        var rsv = ethJSUtil.ecsign(personalMsg, privKey)
        var signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
        cb(null, '0x' + personalMsg.toString('hex'), signedData)
      } catch (e) {
        cb(e.message)
      }
      return
    }
    if (isInjected) {
      const hashedMsg = Web3.utils.sha3(message)
      try {
        addTooltip('Please check your provider to approve')
        this.executionContext.web3().eth.sign(account, hashedMsg, (error, signedData) => {
          cb(error.message, hashedMsg, signedData)
        })
      } catch (e) {
        cb(e.message)
      }
      return
    }

    const hashedMsg = Web3.utils.sha3(message)
    try {
      var personal = new Personal(this.executionContext.web3().currentProvider)
      personal.sign(hashedMsg, account, passphrase, (error, signedData) => {
        cb(error.message, hashedMsg, signedData)
      })
    } catch (e) {
      cb(e.message)
    }
  }

}

module.exports = Settings
